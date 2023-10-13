package handles

func page_provider(ctx request) int {
	ctx.render(ctx.res, webpage{
		lang:  ctx.lang_key,
		title: ctx.lang("提供端", "Provider"),
		body:  ctx.lang("你好", "Hello"),
	})
	return END
}
