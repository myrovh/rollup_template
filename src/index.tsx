import * as React from 'react'
import { render } from 'react-dom'
import { App } from './test'

console.log('file loaded')

export function main() {
  render(<App test="input" />, document.getElementById('app'))
}
