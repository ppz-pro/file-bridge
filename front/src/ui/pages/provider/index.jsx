import { Layout } from '../../cmps/layout'
import { useState_root_handle } from './state'
import { P } from '../../style/styled'
import { Tree } from './tree'

const Provider_page = () => {
  const [root_handle, set_root_handle] = useState_root_handle()

  return <Layout title = '丑丑仔 提供端'>
    <main>
      <P>
        <button
          onClick = {pick_dir(set_root_handle)}
        >
          {root_handle ? '重选文件夹' : '选择文件夹'}
        </button>
      </P>
      {root_handle &&
        <P>
          <Tree handle = {root_handle} />
        </P>
      }
    </main>
  </Layout>
}

const pick_dir = (set_root_handle) => async () =>
  set_root_handle(await window.showDirectoryPicker())

export default {
  path: ['/', '/provider'],
  El: Provider_page,
}
