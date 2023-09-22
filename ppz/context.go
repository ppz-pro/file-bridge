package ppz

import "net/http"

const cn = "cn"
const en = "en"

type Request_context struct { // coc: 下划线开头的对象仅用于文件内部
	Res http.ResponseWriter
	Req *http.Request

	Lang_key string
}

func (ctx Request_context) Lang(cn_str string, en_str string) string {
	switch ctx.Lang_key {
	case cn:
		return cn_str
	case en:
		return en_str
	default:
		panic("unknown lang key:" + ctx.Lang_key)
	}
}

func make_request_context(res http.ResponseWriter, req *http.Request) Request_context {
	var lang_key string
	switch req.URL.Query()["lang"][0] {
	case "", cn: // 未指定语言时，用中文
		lang_key = cn
	default: // 指定了不支持的语言时，用英文
		lang_key = en
	}
	return Request_context{res, req, lang_key}
}
