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
      return map.get(id)?.children
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
      }
      summary {
        cursor: pointer;
      }
      summary, .file_name {
        padding: .3em .5em;
      }
      .file_name::before {
        content: '#';
        font-weight: bold;
        margin-right: .66em;
        opacity: .5;
      }
      .details_body {
        padding: 0 1.666em;
      }
    </style>
  `

  return [
    {
      path: '/',
      handle({ lang_key, respond_html }) {
        respond_html(
          lang_key,
          lang_common.title[lang_key],
          `
            <p>
              ${lang('把这台电脑当作文件 ', 'This computor is a file ')[lang_key]}
              <a href='./as_provider'>${lang('提供端', 'provider')[lang_key]}</a>
              ${lang('或者', 'or')[lang_key]}
              <a href='./as_downloader'>${lang('下载端', 'downloader')[lang_key]}</a>
            </p>
          `
        )
      }
    },
    {
      path: '/as_provider',
      handle({ res, lang_key, respond_html }) {
        respond_html(
          lang_key,
          lang_common.title_(lang('提供端', 'Provider'), lang_key),
          `
            <p>
              <button onclick="serve()">${lang('选择目录', 'Select a directory')[lang_key]}</button>
            </p>
            <p id="serve_tip"></p>
            ${File_tree()}
            <script>
              let root = null
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
                  <a href="../as_downloader?id=\${provider_id}" target="_blank">
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
        json.write(provider_manager.get_provider(id))
      }
    },
    {
      path: '/as_downloader',
      handle({ query, lang_key, respond_html }) {
        respond_html(
          lang_key,
          lang_common.title[lang_key],
          `
            <main></main>
            <script>
              const provider_id = ${query.id}
              if (!provider_id)
                alert('${lang('未检测到“文件提供端 ID”', 'no provider ID')[lang_key]}')
              main()

              async function main() {
                const children = await http.GET('provider?id=${query.id}')
                console.log({ children })
              }
            </script>
          `
        ) 
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
          </head>
          <body>
            <h1>${title}</h1>
            ${body}
          </body>
        </html>
      `)
    }
  }
}
