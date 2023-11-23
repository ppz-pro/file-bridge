import styled from '@emotion/styled'
import { Switch } from '../../cmps/switch'
import { P } from '../../style/styled'
import { useState_serving, useState_serving_webpage } from './state/options'

export
const Switches = () =>
  <Switches_container>
    <Serving />
    <Serving_website />
  </Switches_container>

const Switches_container = styled.div`
  margin: 2em 0;
`

const Serving = () => {
  const [serving, set_serving] = useState_serving()
  return <Row>
    <Switch value={serving} set_value={set_serving} />
    <span>{serving ? 'serving' : 'not serving'}</span>
  </Row>
}

const Serving_website = () => {
  const [serving, set_serving] = useState_serving()
  const [serving_ws, set_serving_ws] = useState_serving_webpage()
  return <Row>
    <Switch
      value={serving_ws}
      set_value={set_serving_ws}
    />
    <span>
      {
        !serving
          ? 'not serving'
          : (serving_ws ? 'serving website' : 'serving files')
      }
    </span>
  </Row>
}

const Row = styled(P)`
  display: flex;
  align-items: center;
  justify: content;
  span {
    margin-left: 1em;
  }
`
