package handles

type Animal struct {
	Name string `json:"name"`
	Year int    `json:"year"`
}

func test_json(ctx request) int {
	ani, code := read_json_end[Animal](ctx)
	if code != SUCCESS {
		return code
	}
	code = write_json_end(ctx, ani)
	if code != SUCCESS {
		return code
	}
	return END
}

func test_query(ctx request) int {
	q := ctx.req.URL.Query()
	year := q["year"]
	tel := q["tel"]
	write_json_end(ctx, append(year, tel...))
	return END
}
