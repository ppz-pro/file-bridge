import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import downloader from './pages/downloader'
import provider from './pages/provider'

const get_pages = list => {
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
  
  return result.map(([ path, El ]) => ({
    path,
    element: <El />
  }))
}

const router = createBrowserRouter(
  get_pages([
    downloader,
    provider,
  ])
)

export
const Router = () =>
  <RouterProvider router = {router} />
