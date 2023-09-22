package handler

import (
	"_/ppz"
	"fmt"
)

func Page_provider(ctx ppz.Request_context) {
	fmt.Println(ctx.Lang_key)
	render(ctx.Res, webpage{"cn", "Provider", "hello"})
}
