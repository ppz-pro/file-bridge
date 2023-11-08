import { useEffect, useState } from "react"

export
const useMount = on_mount =>
  useEffect(
    () => {
      on_mount()
    },
    [],
  )

/** useMount and watch */
export
const useMount_w = (watch, cb) =>
  useEffect(
    () => {
      cb()
    },
    watch
  )

export
const useData = ({ get, default_value, watch = []}) => {
  const [val, set_val] = useState(default_value)
  useMount_w(
    watch,
    () => get().then(set_val),
  )
  return val
}
