import React from 'react'

import { useVal_route } from '../state/router'
import { useRouter_push } from '../state/router'

import { Provider } from './pages/provider'
import { Downloader } from './pages/downloader'

const routes = {
  '/': Provider,
  '/provider': Provider,
  '/downloader': Downloader,
}

export
const Router = () => {
  const Page = routes[useVal_route()]
  if (!Page)
    return <div>404</div>

  return <Page />
}

export
const Link = ({ children, to, ...props }) => {
  const push_route = useRouter_push()

  return <a
    {...props}
    href = {to}
    onClick = {evt => {
      push_route(to)
      evt.preventDefault()
    }}
  >
    {children}
  </a>
}
