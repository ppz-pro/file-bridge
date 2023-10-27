import { atom, useAtom } from 'jotai'

const route = atom('/')
const useState_route = () => useAtom(route)
export
const useVal_route = () => useState_route()[0]
const useSet_route = () => {
  const set = useState_route()[1]
  return (path) => {
    console.debug('set route', path)
    set(path)
  }
}

const history = atom([])
const useState_history = () => useAtom(history)
const useVal_history = () => useState_history()[0]
const useSet_history = () => useState_history()[1]

export
const useRouter_push = () => {
  const set_route = useSet_route()
  const set_history = useSet_history()

  return path => {
    set_history(old => ([...old, path]))
    set_route(path)
  }
}
