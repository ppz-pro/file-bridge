package handles

type Animal struct {
	Name string `json:"name"`
	Year int    `json:"year"`
}

func test_json(ctx request) int {
	ani, ok := read_json[Animal](ctx)
	if !ok {
		return ERR_BAD_REQEUST
	}
	write_json(ctx, ani)
	return END
}
