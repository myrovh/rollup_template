import * as React from 'react'
import { css } from '@emotion/core'

type entryInfo = {
  URL: string
  timestamp: string
}

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
                color: 'hotpink';
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
