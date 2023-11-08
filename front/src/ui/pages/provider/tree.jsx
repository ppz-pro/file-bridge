import { useState } from 'react'
import styled from '@emotion/styled'
import { Triangle } from '../../cmps/triangle'
import { useBool } from '../../../common/hooks'
import { Sync_job } from '../../../common/utils'

export
const Tree = ({ handle }) =>
  <Tree_cont>
    <Dir handle = { handle } />
  </Tree_cont>


const Dir = ({ handle }) => {
  const [children, set_children] = useState()
  const [collapse, toggle_collapse] = useBool(true)

  return <Dir_cont>
    <Dir_name_ onClick = {Toggle_dir(handle, children, set_children, toggle_collapse)}>
      <Triangle_ collapse = {collapse}/>
      {handle.name}
    </Dir_name_>
    {children && !collapse &&
      <Children_cont>
        {children.map((handle, index) => {
          const Child = handle.kind == 'file' ? File : Dir
          return <Child handle = {handle} key = {index} />
        })}
      </Children_cont>
    }
  </Dir_cont>
}

const File = ({ handle }) =>
  <div>{handle.name}</div>

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

const Toggle_dir = (handle, children, set_children, toggle_collapse) =>
  Sync_job(async () => {
    if (!children) {
      const childs = []
      for await (const child_handle of handle.values())
        childs.push(child_handle)
      console.log('retrieved children of', handle.name, childs)
      set_children(childs)
    }
    toggle_collapse()
  }, 'toggle dir')
