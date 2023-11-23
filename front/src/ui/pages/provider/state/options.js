// `用户`对 provider 的设置
import { UseState } from '../../../../common/state_helper'
import server from '../server'

const useState_serving = UseState(1) // 0: serving; 1: not serving; 2: starting
export
const useComplex_serving = () => {
  const [serving, set_serving] = useState_serving()
  return [
    serving,
    async new_serving => {
      if (new_serving) {
        set_serving(2)
        await server.start()
        set_serving(0)
      } else {
        set_serving(1)
        await server.stop()
      }
    }
  ]
}

export
const useState_serving_webpage = UseState(false)
