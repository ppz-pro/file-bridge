import { Layout } from '../../cmps/layout'
import { useState_root_handle, useVal_provider_id } from './state'
import { P } from '../../style/styled'
import { Tree } from './tree'
import { Switches } from './switches'

const Provider_page = () => {
  const [root_handle, set_root_handle] = useState_root_handle()
  const provider_id = useVal_provider_id()

  return <Layout title = '丑丑仔 提供端'>
    {provider_id
      ? <main>
        <P>
          <button
            onClick = {pick_dir(set_root_handle)}
          >
            {root_handle ? '重选文件夹' : '选择文件夹'}
          </button>
        </P>
        {root_handle &&
          <>
            <Switches />
            <P>
              <Tree handle = {root_handle} />
            </P>
          </>
        }
      </main>
      : 'requesting provider id'
    }
  </Layout>
}

const pick_dir = (set_root_handle) => async () =>
  set_root_handle(await window.showDirectoryPicker())

export default {
  path: ['/', '/provider'],
  El: Provider_page,
}
