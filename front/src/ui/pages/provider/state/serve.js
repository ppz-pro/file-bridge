import { UseState } from '../../../../common/state_helper'

const useState_ws_conn = UseState()
export
const useVal_wx_conn = () =>
  useState_ws_conn()[0]

export
const useStart_serve = () => {
  const [conn, set_conn] = useState_ws_conn()
  return () => {
    if (conn)
      throw Error('Already started')
    set_conn(new WebSocket(`ws://${location.host}/provider/conn`)) // location.host = location.hostname + location.port
  }
}
