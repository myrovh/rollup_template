import { render } from 'react-dom'
import { App } from './App'

export function main(): void {
  render(<App />, document.getElementById('app'))
}
import * as React from 'react'
