#!/usr/bin/env node
const { createServer } = require('http')
const Querystring = require('querystring')

const PORT = 6666
const router = make_router()
const provider_manager = make_provider_manager()

let provider_id = 0

createServer(
  function handle(request, response) {
    try {
      // console.log('receive request', request.url)
      const [path_target, ...querystring] = request.url.split('?') // 第一个问号前是 path，之后是 query
      let { lang, ...query } = Querystring.parse(querystring.join('?'))
      switch(lang) {
        case 'cn':
        case 'en':
          break
        case undefined: // 默认中文
          lang = 'cn'
          break
        default: // 遇到不支持的语言就使用英文
          lang = 'en'
          break
      }

      const handler = router.find(({ path, method = 'GET' }) => path == path_target && method == request.method)
      if(handler)
        handler.handle(make_request_context(request, response, lang, query))
      else {
        response.writeHead(404)
        response.end('404')
      }
    } catch (err) {
      console.error('error occured on handling request', err)
    }
  }
).listen(PORT,
  function on_server_started() {
    console.log('file bridge started on ', PORT)
  }
)

function make_router() {
  const lang = (cn, en) => ({ cn, en })
  const lang_common = {
    title: lang('文件桥', 'File Bridge'),
    title_: (lang, key) => lang_common.title[key] + ' ' + lang[key],
  }
  // 渲染目录树
  const File_tree = () => `
    <main></main>
    <style>
      main:not(:empty) {
        background: #00000008;
        padding: .58em .88em;
      }
      details {
        line-height: 1;
        border-left: 1px solid #00000008;
      }
      summary {
        cursor: pointer;
      }
      summary, .file_name {
        padding: .3em .5em;
      }
      a.file_name {
        display: block;
        text-decoration: none;
      }
      .file_name::before {
        content: '#';
        font-weight: bold;
        margin-right: .66em;
        color: #888;
      }
      .details_body {
        padding: 0 1.666em;
      }
    </style>
  `

  return [
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
            ${File_tree()}
            <script>
              let root = null
              let heart_beat_id = null
              let provider_id = ${++provider_id}

              async function serve() {
                const Proto = self => Object.assign(Object.create({
                  toJSON() {
                    return {
                      name: this.name,
                      children: this.children,
                    }
                  }
                }), self)
                const Dir = (handle, name) => Proto({
                  handle,
                  name,
                  children: []
                })
                const File = (handle, name) => Proto({ handle, name })

                // 1. 构建文件目录树
                root = await async function build_tree(dir) {
                  for await (const [name, handle] of dir.handle.entries())
                    dir.children.push(
                      await {
                        file: () => File(handle, name),
                        directory: () => build_tree(Dir(handle, name))
                      }[handle.kind]()
                    )
                  return dir
                }(Dir(await window.showDirectoryPicker()))

                // 2. 填充提示信息
                document.getElementById('serve_tip').innerHTML = \`
                  ${lang('已开启，客户端访问', 'serving on')[lang_key]}
                  <a href="../downloader?id=\${provider_id}" target="_blank">
                    ${lang('这个链接', 'this link')[lang_key]}
                  </a>
                \`

                // 3. 展示文件目录树
                const main = document.querySelector('main')
                const build_details = (header, body) =>
                  '<details><summary>' + header + '</summary><div class="details_body">' + body + '</div></details>'
                main.innerHTML = function build_html(dir) {
                  return build_details(
                    '/' + dir.name,
                    dir.children.map(item => item.children
                      ? build_html(item)
                      : '<div class="file_name">' + item.name + '</div>'
                    ).join('')
                  )
                }({
                  name: '',
                  children: root.children
                })
                
                // 4. 上报服务器
                http.POST('/provider', {
                  provider_id,
                  children: root.children,
                })

                // 5. heat beat
                if (heart_beat_id)
                  cleatInterval(heart_beat_id)
                heart_beat_id = setInterval(async function heart_beat() {
                  console.log('heart beat')
                  const { path } = await http.GET('/to_download?id=' + provider_id)
                  if (!path) return
                  // 获取到 path 之后，立刻获取下一个（否则 1 秒只能开始一个下载）
                  heart_beat()
                  // 开始上传
                  console.log('uploading ', path)
                  ;(async function upload(path_arr, siblings) { // 递归找到目标文件并上传
                    const target_name = path_arr.shift() // 路径一层一层剥开
                    const target = siblings.find(sib => sib.name == target_name)
                    if (path_arr.length) // 如果还没剥完，就进入下一层递归
                      return upload(path_arr, target.children)
                    else // 剥完了，就开始上传（递归结束）
                      fetch(
                        \`/download?id=\${provider_id}&path=\` + encodeURIComponent(path),
                        {
                          method: 'POST',
                          body: await target.handle.getFile()
                        }
                      )
                  })(path.split('/').slice(1), root.children)
                }, 1000)
              }
            </script>
          `
        )
      }
    },
    { // 提供端接口：上报用户指定的目录结构
      method: 'POST',
      path: '/provider',
      async handle({ json, success }) {
        const { provider_id, children } = await json.read()
        provider_manager.set_provider(provider_id, children)
        success()
      }
    },
    { // 提供端接口：心跳（保持与桥的连接）、获取待下载文件路径
      path: '/to_download',
      handle({ query, json }) {
        const id = parseInt(query.id)
        const path = provider_manager.get_provider(id)?.next()
        json.write({ path })
      }
    },
    { // 提供端接口：上传“待下载文件”
      path: '/download',
      method: 'POST',
      handle({ req, query, success }) {
        console.log('post download')
        const { id, path } = query
        const provider = provider_manager.get_provider(parseInt(id))
        if (!provider)
          console.error('no provider')
        else {
          console.log('sending', { id, path })
          provider.send(path, req)
        }
        success()
      }
    },

    { // 页面：下载端
      path: '/downloader',
      handle({ query, lang_key, respond_html }) {
        respond_html(
          lang_key,
          lang_common.title_(lang('下载端', '- Downloader'), lang_key),
          `
            ${File_tree()}
            <script>
              const provider_id = ${query.id}
              if (!provider_id)
                alert('${lang('未检测到“文件提供端 ID”', 'no provider ID')[lang_key]}')
              main()

              async function main() {
                const children = await http.GET('provider?id=${query.id}')

                const build_details = (header, body) => \`
                  <details>
                    <summary>\${header}</summary>
                    <div class="details_body">\${body}</div>
                  </details>
                \`
                document.querySelector('main').innerHTML = function build_file_tree(dir, parent_path) {
                  return build_details(
                    '/' + dir.name,
                    dir.children.map(item => {
                      const path = parent_path + '/' + item.name
                      return item.children
                        ? build_file_tree(item, path)
                        : \`
                          <a
                            class="file_name"
                            target="_blank"
                            download="\${item.name}"
                            href="./download?id=${query.id}&path=\${encodeURIComponent(path)}"
                          >\${item.name}</a>
                        \`
                    }).join('')
                  )
                }({ name: '', children }, '')
              }
            </script>
          `
        ) 
      }
    },
    { // 下载端接口：获取提供端目录结构
      path: '/provider',
      handle({ query, json }) {
        const id = parseInt(query.id)
        json.write(provider_manager.get_provider(id)?.children)
      }
    },
    { // 下载端接口：下载文件
      path: '/download',
      handle({ res, query }) {
        const id = parseInt(query.id)
        provider_manager.get_provider(id).push(res, query.path)
      }
    },
  ]
}

function make_provider_manager() {
  class Provider {
    set_children(children) { // 提供端目录结构
      this.children = children
    }

    #wait = [] // 待下载列表
    push(res, path) {
      this.#wait.push({
        res,
        path,
        status: 'to_check',
      })
    }

    next() { // 下一个“待下载”目标
      const next = this.#wait.find(item => item.status == 'to_check')
      if (!next) return

      next.status = 'checked'
      return next.path
    }

    send(path, req) { // 传输文件
      const wait = this.#wait.find(item => item.path == path && item.status == 'checked')
      wait.status = 'sending'
      req.pipe(wait.res)
    }
  }

  const map = new Map() // Map<provider_id => provider>
  return { // 这个对象用来管理“提供端”
    set_provider(id, children) { // 管理端上报自己的目录结构，开始 serving
      console.log('new provider', { id })
      if (!map.has(id)) // 如果 map 里没有，则是一个新的管理端；如果有，则是管理端重选了 serving 目录
        map.set(id, new Provider())
      map.get(id).set_children(children)
    },
    get_provider(id) {
      return map.get(id)
    }
  }
}

function make_request_context(request, response, lang_key, query) {
  // 读写 json 数据
  const json = {
    read: () => new Promise((resolve, reject) => {
      const result = []
      request.on('data', chunk => result.push(chunk))
      request.on('end', () => resolve(JSON.parse(result.join(''))))
      request.on('error', reject)
    }),
    write: data => response.end(JSON.stringify(data))
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
            <script>
              window.http = new Proxy({}, { // 封装一个 http 客户端（类似 axios）
                get(_, method) {
                  return (path, data) => fetch(path, {
                    method,
                    body: data && JSON.stringify(data)
                  }).then(res => res.json())
                }
              })
            </script>
            <style>
              body {
                max-width: 1200px;
                margin: 2em auto;
                padding: 0 3em;
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
                margin: 0 1em;
              }
            </style>
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
                const cn_btn = document.createElement('a')
                cn_btn.innerHTML = '中文'
                const en_btn = document.createElement('a')
                en_btn.innerHTML = 'English'
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
