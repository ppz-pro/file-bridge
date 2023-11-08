import { Layout } from '../../cmps/layout'
import { useState_root_path } from './state'

const Provider_page = () => {
  const [root_path, set_root_path] = useState_root_path()

  return <Layout title = '丑丑仔 提供端'>
    <main>
      <p>
        <button
          onClick = {pick_dir}
        >
          {root_path ? '重选文件夹' : '选择文件夹'}
        </button>
      </p>
    </main>
  </Layout>
}

const pick_dir = async () => {
  const root_dir_handle = await window.showDirectoryPicker()
  console.log({ root_dir_handle })
}

export default {
  path: ['/', '/provider'],
  El: Provider_page,
}
