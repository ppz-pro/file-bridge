package handles

import "_/context"

func page_provider(ctx context.Request) int {
	ctx.App.Render(ctx.Res, context.Webpage{
		Lang:  ctx.Lang_key,
		Title: ctx.Lang("提供端", "Provider"),
		Body:  ctx.Lang("你好", "Hello"),
	})
	return END
}
