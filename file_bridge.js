#!/usr/bin/env node
const { createServer } = require('http')
const Querystring = require('querystring')

const PORT = 6666
const router = make_router()
const provider_manager = new function() {
  /** 文件提供者 */
  class Provider {
    set_children(children) {
      this.children = children
    }

    #wait = []
    push(res, path) {
      this.#wait.push({
        res,
        path,
        status: 'to_check',
      })
    }

    next() {
      const next = this.#wait.find(item => item.status == 'to_check')
      if (!next) return

      next.status = 'checked'
      return next.path
    }

    send(path, req) {
      const wait = this.#wait.find(item => item.path == path && item.status == 'checked')
      wait.status = 'sending'
      req.pipe(wait.res)
    }
  }

  const map = new Map()

  return {
    set_provider(id, children) {
      console.log('new provider', { id })
      if (!map.has(id))
        map.set(id, new Provider())
      map.get(id).set_children(children)
    },
    get_provider(id) {
      return map.get(id)
    }
  }
}

let provider_id = 0

createServer(
  function handle(request, response) {
    try {
      console.log('receive request', request.url)
      const [path_target, querystring] = request.url.split('?')
      let { lang, ...query } = Querystring.parse(querystring)
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
      console.error(err)
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
    lang_declaration: lang('zh', 'en'),
  }

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
    {
      // path: '/as_provider',
      path: '/',
      handle({ res, lang_key, respond_html }) {
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
                }(
                  Dir(await window.showDirectoryPicker())
                )

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

                // 5. clear heat beat
                if (heart_beat_id)
                  cleatInterval(heart_beat_id)
                heart_beat_id = setInterval(async function upload() {
                  console.log('heart beat')
                  const { path } = await http.GET('/to_download?id=' + provider_id)
                  console.log({ path })
                  if (!path) return
  
                  upload()
                  
                  console.log('uploading ', path)
                  const file_handle = async function get_handle(path_arr, siblings) {
                    const target_name = path_arr.shift()
                    const target = siblings.find(sib => sib.name == target_name)
                    if (path_arr.length)
                      return get_handle(
                        path_arr,
                        target.children,
                      )
                    else {

                      console.log('upload file', await target.handle.getFile())

                      fetch(
                        \`/download?id=\${provider_id}&path=\` + encodeURIComponent(path),
                        {
                          method: 'POST',
                          body: await target.handle.getFile()
                        }
                      )
                    }
                  }(path.split('/').slice(1), root.children)
                }, 1000)
              }
            </script>
          `
        )
      }
    },
    {
      path: '/provider',
      method: 'POST',
      async handle({ json, success }) {
        const { provider_id, children } = await json.read()
        provider_manager.set_provider(provider_id, children)
        success()
      }
    },
    {
      path: '/provider',
      handle({ query, json }) {
        const id = parseInt(query.id)
        json.write(provider_manager.get_provider(id)?.children)
      }
    },
    {
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
    {
      path: '/download',
      handle({ res, query }) {
        const id = parseInt(query.id)
        provider_manager.get_provider(id).push(res, query.path)
      }
    },
    {
      path: '/to_download',
      handle({ query, json }) {
        const id = parseInt(query.id)
        const path = provider_manager.get_provider(id)?.next()
        json.write({ path })
      }
    },
    {
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
    }
  ]
}

function make_request_context(request, response, lang_key, query) {
  const json = {
    read: () => new Promise((resolve, reject) => {
      const result = []
      request.on('data', chunk => result.push(chunk))
      request.on('end', () => resolve(JSON.parse(result.join(''))))
      request.on('error', reject)
    }),
    write: data => response.end(JSON.stringify(data))
  }
  const success = () => json.write('success')
  return {
    req: request,
    res: response,
    lang_key, query, json, success,
    respond_html(lang, title, body) {
      response.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' })
      response.end(`
        <!DOCTYPE html>
        <html lang='${{ cn: 'zh', en: 'en' }[lang]}'>
          <head>
            <title>${title}</title>
            <meta charset='utf8'>
            <script>
              window.http = new Proxy({}, {
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
              .options_container {
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
              ;(function init_multi_lang() {
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
