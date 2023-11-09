import { useState } from 'react'
import styled from '@emotion/styled'
import { filesize } from 'filesize'
import { Triangle } from '../../cmps/triangle'
import { useBool, useData } from '../../../common/hooks'
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

const File = ({ handle }) => {
  const size = useData({
    get: async () =>
      (await handle.getFile()).size
    ,
    watch: [handle],
  })

  return <File_cont>
    {handle.name}
    {size &&
      <span>{filesize(size)}</span>
    }
  </File_cont>
}

const File_cont = styled.div`
  &:hover span {
    color: #333;
  }
  span {
    font-size: .8em;
    margin-left: 1rem;
    color: #888;
  }
`

const Tree_cont = styled.div`
  padding: 1em 2em;
  background: rgba(0,0,0,.02888);
  line-height: 1.8;
`

const Dir_cont = styled.div`
`

const Dir_name_ = styled.div`
  cursor: pointer;
  user-select: none;
  &:hover i {
    color: rgba(0,0,0,1);
  }
  i {
    color: rgba(0,0,0,.38);
  }
`

const Children_cont = styled.div`
  margin-left: .25rem;
  border-left: 1px solid rgba(0,0,0,.0666);
  padding-left: calc(1.05rem - 1px);
  &:hover {
    border-left-color: rgba(0,0,0,.1888);
  }
`

const Triangle_ = styled(Triangle)`
  transition: all .1s;
  font-size: .6rem;
  margin-right: .7rem;
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
