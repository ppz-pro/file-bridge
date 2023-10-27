import { Router } from './router'
import { Link } from './router'

export
const App = () => {
  return <>
    <Link to = '/provider'>provider</Link>
    <Link to = '/downloader'>downloader</Link>

    <Router />
  </>
}
