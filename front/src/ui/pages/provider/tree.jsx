import { useState } from 'react'
import styled from '@emotion/styled'
import { Triangle } from '../../cmps/triangle'
import { useBool } from '../../../common/hooks'

export
const Tree = ({ handle }) =>
  <Tree_cont>
    <Dir handle = { handle } />
  </Tree_cont>


const Dir = ({ handle }) => {
  const [children, set_children] = useState()
  const [collapse, toggle_collapse] = useBool(true)

  return <Dir_cont>
    <Dir_name_ onClick = {toggle_collapse}>
      <Triangle_ collapse = {collapse}/>
      {handle.name}
    </Dir_name_>
    {children &&
      <Children_cont>
        {children.map(child =>
          child.kine == 'file'
            ? <File handle = {child} />
            : <Dir handle = {child} />
        )}
      </Children_cont>
    }
  </Dir_cont>
}

const Tree_cont = styled.div`

`

const Dir_cont = styled.div`
`

const Dir_name_ = styled.div`
  cursor: pointer;
  user-select: none;
`

const Children_cont = styled.div`
`

const Triangle_ = styled(Triangle)`
  transition: transform .1s;
  font-size: .6em;
  margin-right: .5em;
  transform: rotate(${props => props.collapse ? 90 : 180}deg);
`
