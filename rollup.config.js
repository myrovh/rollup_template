// Copied from https://github.com/philipwalton/rollup-native-modules-boilerplate

import analyse from 'rollup-plugin-analyzer'
import babel from 'rollup-plugin-babel'
import clear from 'rollup-plugin-clear'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import nunjucks from 'nunjucks'
import path from 'path'
import pkg from './package.json'
import progress from 'rollup-plugin-progress'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'

// NOTE: this value must be defined outside of the plugin because it needs
// to persist from build to build (e.g. the module and nomodule builds).
// If, in the future, the build process were to extends beyond just this rollup
// config, then the manifest would have to be initialized from a file, but
// since everything  is currently being built here, it's OK to just initialize
// it as an empty object object when the build starts.
const manifest = {}

/**
 * A Rollup plugin to generate a manifest of chunk names to their filenames
 * (including their content hash). This manifest is then used by the template
 * to point to the correct URL.
 * @return {Object}
 */
function manifestPlugin() {
  return {
    name: 'manifest',
    generateBundle(options, bundle) {
      for (const [name, assetInfo] of Object.entries(bundle)) {
        manifest[assetInfo.name] = name
      }

      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest, null, 2),
      })
    },
  }
}

/**
 * A Rollup plugin to generate an index.html with entry chunks embedded.
 * @return {Object}
 */
function generateHtmlPlugin() {
  return {
    name: 'htmlGenerate',
    generateBundle(options, bundle) {
      for (const [name, assetInfo] of Object.entries(bundle)) {
        manifest[assetInfo.name] = name
      }

      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: nunjucks.render('src/index.html', {
          manifest,
          ENV: process.env.NODE_ENV || 'development',
        }),
      })
    },
  }
}

/**
 * A Rollup plugin to generate a list of import dependencies for each entry
 * point in the module graph. This is then used by the template to generate
 * the necessary `<link rel="modulepreload">` tags.
 * @return {Object}
 */
function modulepreloadPlugin() {
  return {
    name: 'modulepreload',
    generateBundle(options, bundle) {
      // A mapping of entry chunk names to their full dependency list.
      const modulepreloadMap = {}

      // Loop through all the chunks to detect entries.
      for (const [fileName, chunkInfo] of Object.entries(bundle)) {
        if (chunkInfo.isEntry || chunkInfo.isDynamicEntry) {
          modulepreloadMap[chunkInfo.name] = [fileName, ...chunkInfo.imports]
        }
      }

      this.emitFile({
        type: 'asset',
        fileName: 'modulepreload.json',
        source: JSON.stringify(modulepreloadMap, null, 2),
      })
    },
  }
}

function basePlugins({ nomodule = false } = {}) {
  const extensions = ['.js', '.mjs', '.ts', '.tsx']
  const plugins = [
    clear({ targets: [pkg.config.publicDir] }),
    nodeResolve({
      extensions,
    }),
    commonjs(),
    babel({
      extensions,
      exclude: /node_modules/,
      presets: [
        nomodule
          ? ['@babel/preset-env', { targets: '> 0.25%, not dead' }]
          : ['@babel/preset-modules', { loose: true }],
        '@babel/preset-typescript',
        '@babel/preset-react',
      ],
    }),
    manifestPlugin(),
    generateHtmlPlugin(),
    progress(),
    analyse({ summaryOnly: true }),
  ]
  // Only add minification in production and when not running on Glitch.
  if (process.env.NODE_ENV === 'production') {
    plugins.push(
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
    )
    plugins.push(terser({ module: !nomodule }))
  }
  return plugins
}

// Module config for <script type="module">
const moduleConfig = {
  input: {
    main: 'src/main-module.ts',
  },
  output: {
    dir: pkg.config.publicDir,
    format: 'esm',
    entryFileNames: '[name]-[hash].mjs',
    chunkFileNames: '[name]-[hash].mjs',
    dynamicImportFunction: '__import__',
  },
  plugins: [...basePlugins(), modulepreloadPlugin()],
  manualChunks(id) {
    if (id.includes('node_modules')) {
      // The directory name following the last `node_modules`.
      // Usually this is the package, but it could also be the scope.
      const directories = id.split(path.sep)
      const name = directories[directories.lastIndexOf('node_modules') + 1]

      // Group react dependencies into a common "react" chunk.
      // NOTE: This isn't strictly necessary for this app, but it's included
      // as an example to show how to manually group common dependencies.
      if (name.match(/^react/) || ['prop-types', 'scheduler'].includes(name)) {
        return 'react'
      }

      // Group `tslib` and `dynamic-import-polyfill` into the default bundle.
      // NOTE: This isn't strictly necessary for this app, but it's included
      // to show how to manually keep deps in the default chunk.
      if (name === 'tslib' || name === 'dynamic-import-polyfill') {
        return
      }

      // Otherwise just return the name.
      return name
    }
  },
  watch: {
    include: 'src/**',
    chokidar: true,
    clearScreen: false,
  },
}

// Legacy config for <script nomodule>
const nomoduleConfig = {
  input: {
    nomodule: 'src/main-nomodule.ts',
  },
  output: {
    dir: pkg.config.publicDir,
    format: 'iife',
    entryFileNames: '[name]-[hash].js',
  },
  plugins: basePlugins({ nomodule: true }),
  inlineDynamicImports: true,
  watch: {
    include: 'src/**',
    chokidar: true,
    clearScreen: false,
  },
}

const configs = [moduleConfig]
if (process.env.NODE_ENV === 'production') {
  configs.push(nomoduleConfig)
}

export default configs
