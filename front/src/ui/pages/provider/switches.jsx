import { Switch } from '../../cmps/switch'
import { P } from '../../style/styled'
import { useState_serving, useState_serving_webpage } from './state/options'

export
const Switches = () => {
  const [serving, set_serving] = useState_serving()
  const [serving_wp, set_serving_wp] = useState_serving_webpage()

  return <P>
    <Switch value={serving} set_value={set_serving} />
  </P>
}