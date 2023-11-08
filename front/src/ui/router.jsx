import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import downloader from './pages/downloader'
import provider from './pages/provider'

const list = [
  downloader,
  provider,
]

const router = new function() {
  const result = []
  for (const page of list)
    if (page.path instanceof Array)
      result.push(
        ...page.path.map(path =>
          ([path, page.El])
        )
      )
    else
      result.push([page.path, page.El])
  
  return createBrowserRouter(
    result.map(([ path, El ]) => ({
      path,
      element: <El />
    }))
  )
}

export
const Router = () =>
  <RouterProvider router = {router} />
