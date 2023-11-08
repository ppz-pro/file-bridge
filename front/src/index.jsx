import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './ui'

async function main() {
  init_state()
  init_ui()
}
main()

function init_state() {

}

function init_ui() {
  createRoot(
    document.getElementById('app_root')
  )
  .render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
