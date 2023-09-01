#!/usr/bin/env node
const { createServer } = require('http')
const Querystring = require('querystring')

const PORT = 6666
const router = make_router()

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
  const multi_lang = (cn, en) => ({ cn, en })
  const lang = {
    title: multi_lang('文件桥', 'File Bridge'),
  }

  function write_html(res, title, body) {
    res.end(`
      <!DOCTYPE html>
      <html>
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
      lang: {
        p1: multi_lang('把这台电脑当作', 'This computor is a '),
        p2: multi_lang('服务器', 'server'),
        p3: multi_lang('或者', 'or'),
        p4: multi_lang('客户端', 'client')
      },
      handle(res, lang_key) {
        write_html(
          res,
          lang.title[lang_key],
          `
            <p>
              ${this.lang.p1[lang_key]}
              <a href='./as_server'>${this.lang.p2[lang_key]}</a>
              ${this.lang.p3[lang_key]}
              <a href='./as_client'>${this.lang.p4[lang_key]}</a>
            </p>
          `
        )
      }
    }
  ]
}
