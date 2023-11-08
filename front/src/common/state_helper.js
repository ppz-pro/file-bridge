import { atom, useAtom } from "jotai"

export
const UseState = (initial_value) => {
  const atm = atom(initial_value)
  return () => useAtom(atm)
}
