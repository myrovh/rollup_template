import React from 'react'
import ReactDom from 'react-dom'
import { App } from './test'

console.log('file loaded')

export function main() {
  ReactDom.render(<App test="prop input" />, document.getElementById('app'))
}
