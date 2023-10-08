package context

import (
	"net/http"
	"net/url"
)

const cn = "cn"
const en = "en"

type Request struct {
	App App

	Res http.ResponseWriter
	Req *http.Request

	Lang_key string
}

func (ctx Request) Lang(cn_str string, en_str string) string {
	switch ctx.Lang_key {
	case cn:
		return cn_str
	case en:
		return en_str
	default:
		panic("unknown lang key: " + ctx.Lang_key)
	}
}

func _parse_lang(query url.Values) string { // coc: 下划线开头的对象仅用于文件内部
	var lang string
	if len(query["lang"]) > 0 {
		lang = query["lang"][0]
	}
	switch lang {
	case "", cn: // 未指定语言时，用中文
		return cn
	default: // 指定了不支持的语言时，用英文
		return en
	}
}

func New_request(res http.ResponseWriter, req *http.Request, app App) Request {
	query := req.URL.Query()
	lang := _parse_lang(query)
	return Request{app, res, req, lang}
}
