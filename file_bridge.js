#!/usr/bin/env node
const { createServer } = require('http')
const Querystring = require('querystring')

const PORT = 6666
const router = make_router()
let server_id = 0

createServer(
  function handle(request, response) {
    try {
      console.log('receive request', request.url)
      const [path, querystring] = request.url.split('?')
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

      const handler = router.find(h => h.path == path)
      if(handler)
        handler.handle(response, lang, query)
      else
        response.end('<h1>404</h1>')
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

  function respond_html(res, lang_key, title, body) {
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' })
    res.end(`
      <!DOCTYPE html>
      <html lang='${lang_common.lang_declaration[lang_key]}'>
        <head>
          <title>${title}</title>
          <meta charset='utf8'>
        </head>
        <body>
          <h1>${title}</h1>
          ${body}
        </body>
      </html>
    `)
  }

  return [
    {
      path: '/',
      handle(res, lang_key) {
        respond_html(
          res,
          lang_key,
          lang_common.title[lang_key],
          `
            <p>
              ${lang('把这台电脑当作', 'This computor is a ')[lang_key]}
              <a href='./as_server'>${lang('服务器', 'server')[lang_key]}</a>
              ${lang('或者', 'or')[lang_key]}
              <a href='./as_client'>${lang('客户端', 'client')[lang_key]}</a>
            </p>
          `
        )
      }
    },
    {
      path: '/as_server',
      handle(res, lang_key) {
        respond_html(
          res,
          lang_key,
          lang_common.title_(lang('服务器', 'Server'), lang_key),
          `
            <p>
              <button onclick="serve()">${lang('选择目录', 'Select a directory')[lang_key]}</button>
            </p>
            <p id="serve_tip"></p>
            <main></main>
            <style>
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
                content: '# ';
                opacity: .5;
              }
              .details_body {
                padding: 0 1em;
              }
            </style>
            <script>
              let root = null
              
              async function serve() {
                const Dir = (handle, name) => ({
                  handle,
                  name,
                  children: []
                })
                const File = (handle, name) => ({ handle, name })

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
                
                document.getElementById('serve_tip').innerHTML = \`
                  ${lang('已开启，客户端访问', 'serving on')[lang_key]}
                  <a href="../as_client?id=${++server_id}" target="_blank">
                    ${lang('这个链接', 'this link')[lang_key]}
                  </a>
                \`
                
                const main = document.querySelector('main')
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
                function build_details(header, body) {
                  return '<details><summary>' + header + '</summary><div class="details_body">' + body + '</div></details>'
                }
              }
              
            </script>
          `
        )
      }
    }
  ]
}
