import * as React from 'react'
import { css } from '@emotion/core'

type entryInfo = {
  URL: string
  timestamp: string
}

// TODO make async module example (that shows new modules being loaded by the getImportedModules component)
// TODO make typescript usage more complex so tslib integration can be tested
// TODO attempt to use rollup-plugin-ts to combine babel and tsc, compare build time and bundle size
// TODO try some different development servers
// TODO setup hosting on now
// TODO setup eslint
// TODO setup stylelint

export const App = () => {
  function getImportedModules(): entryInfo[] {
    return performance
      .getEntriesByType('resource')
      .filter(entry => entry.name.match(/\.m?js$/))
      .map(entry => {
        const date = new Date(
          Math.round(entry.startTime + performance.timeOrigin),
        )
        return {
          URL: new URL(entry.name, location.href).pathname,
          timestamp: date.toLocaleString(),
        }
      })
  }

  return (
    <div>
      <ul>
        {getImportedModules().map(({ timestamp, URL }) => (
          <li key={URL}>
            [{timestamp}]{' '}
            <a
              css={css`
                color: hotpink;
              `}
              href={URL}
            >
              {URL}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
