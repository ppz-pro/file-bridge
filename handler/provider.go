package handler

import (
	"_/ppz"
)

func Page_provider(ctx ppz.Request_context) {
	render(ctx.Res, webpage{
		ctx.Lang_key,
		ctx.Lang("提供端", "Provider"),
		ctx.Lang("你好", "Hello"),
	})
}
