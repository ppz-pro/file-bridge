#!/usr/bin/env node
const { createServer } = require('http')
const Querystring = require('querystring')

const PORT = 6666
const router = make_router()
const provider_manager = make_provider_manager()
let provider_id = 0

createServer(
  async function handle(request, response) {
    try {
      // console.log('receive request', request.url)
      const [path_target, ...querystring] = request.url.split('?') // 第一个问号前是 path，之后是 query
      let { lang, ...query } = Querystring.parse(querystring.join('?'))
      lang ||= 'cn' // 默认中文
      if (!['cn', 'en'].includes(lang))  // 遇到不支持的语言就使用英文
        lang = 'en'

      const handler = router.find(({ path, method = 'GET' }) => path == path_target && method == request.method)
      if(handler)
        await handler.handle(make_request_context(request, response, lang, query))
      else {
        response.writeHead(404)
        response.end('404')
      }
    } catch (err) {
      console.error('error occured on handling request:', err)
    }
  }
).listen(PORT, () =>
  console.log('file bridge started on ', PORT)
)

function make_router() {
  const lang = (cn, en) => ({ cn, en })
  const lang_common = {
    title: lang('文件桥', 'File Bridge'),
    title_: (lang, key) => lang_common.title[key] + ' ' + lang[key],
  }
  // 渲染目录树
  const File_tree = lang_key => `
    <main></main>
    <script>
      function make_tree_details(dir_handle) { // 文件夹节点
        const children_container = O.div({ className: 'details_body' })
        const container = O.details(null,
          O.summary(null, dir_handle.name),
          children_container
        )
        container.addEventListener('toggle', function on_details_toggle() {
          if(container.open) {
            children_container.innerHTML = '<div class="tip">${lang('加载中', 'loading')[lang_key]}...</div>'
            open_dir(dir_handle, children_container)
          }
        })
        return container
      }
    </script>
    <style>
      main:not(:empty) {
        background: #00000008;
        padding: .58rem .88rem;
      }
      details {
        line-height: 1;
        border-left: 1px solid #00000008;
      }
      summary, .file_container, .tip {
        line-height: 1.6rem;
      }
      summary {
        cursor: pointer;
      }
      .details_body {
        padding: 0 1.666rem;
      }
      .tip {
        color: #666;
        font-size: small;
      }
      .file_container::before {
        content: '#';
        font-weight: bold;
        margin-right: .66rem;
        color: #888;
      }
      .file_container span {
        margin-left: 1.6rem;
        font-size: small;
      }
      .file_container:not(:hover) span {
        color: #bbb;
      }
    </style>
  `

  return [ // 路由列表
    { // 页面：提供端
      path: '/',
      handle({ lang_key, respond_html }) {
        respond_html(
          lang_key,
          lang_common.title_(lang('提供端', '- Provider'), lang_key),
          `
            <p>
              <button onclick="serve()">${lang('选择目录', 'Select a directory')[lang_key]}</button>
            </p>
            <p id="serve_tip"></p>
            ${File_tree(lang_key)}
            <script>
              const provider_id = '${new Date().getTime()}-${++provider_id}'
              let root_dir_handle = null
              let heart_beat_id = null

              async function serve() {
                // 1. 让用户选 serve 的文件夹
                root_dir_handle = await window.showDirectoryPicker()
                // 2. 展示被 serve 的目录
                document.querySelector('main').replaceChildren(make_tree_details(root_dir_handle))
                // 3. 填充提示信息
                document.getElementById('serve_tip').innerHTML = \`
                  ${lang('已开启，客户端访问', 'serving on')[lang_key]}
                  <a href="../downloader?id=\${provider_id}" target="_blank">
                    ${lang('这个链接', 'this link')[lang_key]}
                  </a>
                \`
                // 4. 上报服务器（桥）：我（provider_id）已经在 serve 啦，被 serve 的文件夹是...
                await http.POST('/provider', {
                  provider_id,
                  root_dir_name: root_dir_handle.name,
                })
                // 5. 开始心跳
                clearTimeout(heart_beat_id) // 关掉上次心跳
                let fail = 0 // 心跳连续失败计数
                ;(async function heart_beat() {
                  try {
                    var { unknown_provider, task } = await http.GET('/heart_beat?id=' + provider_id) // 心跳，顺便看看有没有新任务（上传数据、文件）
                    fail = 0 // 连续失败归零
                  } catch(err) {
                    console.error('heart beat failed:', err)
                    if (++fail < 3) // 三次以内，继续心跳
                      return heart_beat()
                    else // 三次以上，reload
                      return reload('${lang('网络连接中断', 'Disconnected')[lang_key]}')
                  }
                  if (unknown_provider) // “重新加载”会重新获取 provider id
                    return reload('${lang('未知的提供端 id', 'Unknown Provider')[lang_key]}')
                  if (task) {
                    heart_beat() // 一次只传来一个任务，收到任务立刻跳下一次（否则一秒只能处理一个任务）
                    const query_str = \`?provider_id=\${provider_id}&task_id=\${task.id}\`
                    if (task.ls) { // 获取目录
                      const url = '/ls' + query_str
                      try {
                        console.log('posting ls', task.ls)
                        await async function post_ls(path_arr, dir_handle) {
                          const target_name = path_arr.shift() // 路径一层一层剥开
                          if (target_name)
                            await post_ls(path_arr, await dir_handle.getDirectoryHandle(target_name))
                          else
                            http.POST(url, { // 没有 await
                              data: await async function() {
                                const list = []
                                for await (const handle of dir_handle.values())
                                  list.push({
                                    name: handle.name,
                                    size: handle.kind == 'file'
                                      ? (await handle.getFile()).size
                                      : undefined
                                  })
                                return list
                              }()
                            })
                        }(
                          task.ls.split('/').slice(2), // 如 /root/folder，split 之后得到 ['', 'root', 'folder']，其中前两项是不要的
                          root_dir_handle,
                        )
                      } catch(err) {
                        console.log
                        http.POST(url, {
                          error: '${lang('获取目录失败', 'failed to get directory')[lang_key]}'
                        })
                      }
                    } else if (task.download) { // 下载文件
                      const url = '/download' + query_str
                      try {
                        console.log('posting download ', task.download)
                        await async function upload(path_arr, dir_handle) { // 递归找到目标文件并上传
                          const target_name = path_arr.shift() // 路径一层一层剥开
                          if (path_arr.length) // 如果还没剥完，就进入下一层递归
                            return upload(path_arr, await dir_handle.getDirectoryHandle(target_name))
                          else // 剥完了，就开始上传（递归结束）
                            fetch(url, { // 没有 await
                              method: 'POST',
                              body: await (await dir_handle.getFileHandle(target_name)).getFile()
                            })
                        }(task.download.split('/').slice(2), root_dir_handle)
                      } catch(err) {
                        console.error('error on posting download: ', err)
                        // todo: 处理下载失败
                      }
                    } else {
                      console.error({ task })
                      throw Error('unknown task')
                    }
                  } else // 没有任务就等一秒
                    heart_beat_id = setTimeout(heart_beat, 1000)
                })()
                function reload(msg) {
                  alert(msg)
                  location.reload()
                }
              }

              async function open_dir(dir_handle, dir_children_container) {
                const children = []
                for await (const handle of dir_handle.values())
                  children.push(handle.kind == 'file'
                    ? O.div({ className: 'file_container' },  // 文件节点
                        O.label(null, handle.name),
                        O.span(null, (await handle.getFile()).size)
                      )
                    : make_tree_details(handle)
                  )
                dir_children_container.replaceChildren(...children)
              }
            </script>
          `
        )
      }
    },
    { // 提供端接口：上报提供端状态“已就绪”
      method: 'POST',
      path: '/provider',
      async handle({ json, success }) {
        const { provider_id, root_dir_name } = await json.read()
        provider_manager.set_provider(provider_id, root_dir_name)
        success()
      }
    },
    { // 提供端接口：心跳（保持与桥的连接）、获取请求任务
      path: '/heart_beat',
      handle({ query, json }) {
        const provider = provider_manager.get_provider(query.id)
        if (provider) {
          let task = provider.wait.check()
          if (task) {
            const { id, params, type } = task
            json.write({ task: { id, [type]: params } })
          } else
            json.write({ nothing: true })
        } else
          json.write({ unknown_provider: true })
      }
    },
    { // 提供端接口：post download
      method: 'POST',
      path: '/download',
      method: 'POST',
      async handle({ req, query, success }) {
        await provider_manager.get_provider(query.provider_id).wait
          .get_respond_wrapper(parseInt(query.task_id))(req)
        success() // 这个响应是发给提供端的：“你已经上传成功了”
      }
    },
    { // 提供端接口：post ls
      method: 'POST',
      path: '/ls',
      async handle({ query, json, success }) {
        await provider_manager.get_provider(query.provider_id).wait
          .get_respond_wrapper(parseInt(query.task_id))(await json.read())
        success() // 这个响应是发给提供端的：“你已经上传成功了”
      }
    },

    { // 页面：下载端
      path: '/downloader',
      handle({ query, lang_key, respond_html, res }) {
        const provider = provider_manager.get_provider(query.id)
        if (!provider)
          return res.end('no provider: ' + query.id)
        respond_html(
          lang_key,
          lang_common.title_(lang('下载端', '- Downloader'), lang_key),
          File_tree(lang_key) + `
            <script>
              const provider_id = '${query.id}'
              document.querySelector('main').replaceChildren(
                make_tree_details({
                  name: '${provider.root_name}',
                  path: '/${provider.root_name}',
                })
              )
              async function open_dir({ path }, children_container) {
                const res = await http.GET(\`/ls?id=\${provider_id}&path=\${encodeURIComponent(path)}\`)
                if (res.error) {
                  alert(res.error)
                  location.reload()
                  return
                }
                children_container.replaceChildren(
                  ...res.data.map( ({ name, size }) =>
                    size === undefined // size 为 undefined 时，是文件夹
                      ? make_tree_details({ name, path: path + '/' + name })
                      : O.div({ className: 'file_container' },
                          O.a({
                            href: \`./download?id=\${provider_id}&path=\${encodeURIComponent(path + '/' + name)}\`
                          }, name),
                          O.span(null, size),
                        )
                  )
                )
              }
            </script>
          `
        )
      }
    },
    { // 下载端接口：获取提供端目录
      path: '/ls',
      handle({ query, json }) {
        provider_manager.get_provider(query.id).wait.push('ls', query.path, list => json.write(list))
      }
    },
    { // 下载端接口：下载文件
      path: '/download',
      handle({ res, query }) {
        provider_manager.get_provider(query.id).wait.push('download', query.path,
          function sending_file(provider_req) {
            res.writeHead(200, {
              'Content-Type': 'application/octet-stream',
              'Content-Disposition': 'attachment; filename=' + encodeURIComponent(query.path.split('/').at(-1)),
            })
            provider_req.pipe(res)
            return new Promise((resolve, reject) => {
              provider_req.on('error', reject)
              provider_req.on('end', resolve)
            })
          }
        )
      }
    }
  ]
}

function make_provider_manager() {
  let wait_id = 0
  const map = new Map() // Map<provider_id => provider>

  class Wait { // 请求的等待
    #map = new Map()
    #to_check = [] // 先进先出
    push(type, params, respond) { // type: 请求类型（现在有 ls 和 download 两种）, params: 请求的参数, respond: 响应请求
      const id = ++wait_id
      const item = { type, id, params, respond }
      this.#map.set(id, item)
      this.#to_check.push(item) // 推进去（最后一个）
      console.log('new waiting', type, id, params)
    }
    check() {
      const target = this.#to_check.shift() // 取出来（第一个）
      if (target)
        console.log('checking task', target)
      return target
    }
    get_respond_wrapper(id) {
      const target = this.#map.get(id)
      return async (...args) => {
        try {
          console.log('responding wait', id, target.type, target.params)
          await target.respond(...args)
          console.log('responded', id)
        } catch (err) {
          console.error(`error on responding Wait(${target.type}, ${id}, ${target.params}): `, err)
        }
        this.#map.delete(id)
      }
    }
  }
  return { // 这个对象用来管理“提供端”
    get_provider: id => map.get(id),
    set_provider(id, root_dir_name) { // 管理端上报自己的目录结构，开始 serving
      console.log('setting up provider', { id, root_dir_name })
      if (!map.has(id)) // 如果 map 里没有，则是一个新的管理端；如果有，则是管理端重选了 serving 目录
        map.set(id, { // 这个就是 provider
          wait: new Wait()
        })
      map.get(id).root_name = root_dir_name
    }
  }
}

function make_request_context(request, response, lang_key, query) {
  const json = { // 读写 json 数据
    read: () => new Promise((resolve, reject) => {
      const result = []
      request.on('data', chunk => result.push(chunk))
      request.on('end', () => resolve(JSON.parse(result.join(''))))
      request.on('error', reject)
    }),
    write: data => {
      response.writeHead(200, {
        'Content-Type': 'application/json'
      })
      response.end(JSON.stringify(data))
    }
  }
  return {
    req: request,
    res: response,
    lang_key, query, json,
    success() { // 写入响应：成功
      json.write('success')
    },
    respond_html(lang, title, body) { // 写入响应：页面（html）
      response.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' })
      response.end(`
        <!DOCTYPE html>
        <html lang='${{ cn: 'zh', en: 'en' }[lang]}'>
          <head>
            <title>${title}</title>
            <meta charset='utf8'>
            <style>
              body {
                max-width: 1200px;
                margin: 2rem auto;
                padding: 0 3rem;
                position: relative;
              }
              .options_container { /* 右上角那些链接、按钮 */
                font-size: small;
                position: absolute;
                right: 0;
                top: 0;
                display: flex;
                align-items: center;
              }
              .options_container > * {
                margin: 0 1rem;
              }
            </style>
            <script>
              window.http = new Proxy({}, { // 封装一个 http 客户端（类似 axios）
                get: (_, method) => (path, data, timeout = 3000) =>
                  fetch(path, {
                    method,
                    signal: AbortSignal.timeout(timeout), // 超时
                    body: data && JSON.stringify(data)
                  }).then(res => res.json())
              })
            </script>
            <script>
              window.O = new Proxy({}, { // 封装 document.createElement
                get: (_, tagname) => (props, ...children) => {
                  const el = document.createElement(tagname)
                  for(const k in props)
                    el[k] = props[k]
                  el.append(...children)
                  return el
                }
              })
            </script>
          </head>
          <body>
            <h1>${title}</h1>
            ${body}
            <div class="options_container">
              <a href="https://github.com/ppz-pro/file-bridge" target="_blank">Github</a>
              <div class="option_pair multi_lang"></div>
            </div>
            <script>
              ;(function init_multi_lang() { // 中英文切换
                const container = document.querySelector('.option_pair.multi_lang')
                const search = new URLSearchParams(location.search)
                const lang = search.get('lang') || 'cn'
                const cn_btn = O.a(null, '中文')
                const en_btn = O.a(null, 'English')
                const is_cn = lang == 'cn'
                search.set('lang', is_cn ? 'en' : 'cn')
                ;(is_cn ? en_btn : cn_btn).href = \`javascript: location.href='\${location.pathname}?\${search}'\`
                container.append(cn_btn, ' / ', en_btn)
              })()
            </script>
          </body>
        </html>
      `)
    }
  }
}
