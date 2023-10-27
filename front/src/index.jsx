import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './ui'

init_state()
init_ui()

function init_state() {

}

function init_ui() {
  createRoot(
    document.getElementById('app_root')
  )
  .render(<App />)
}
