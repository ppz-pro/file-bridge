package handles

import (
	"_/context"
)

type Animal struct {
	Name string `json:"name"`
	Year int    `json:"year"`
}

func test_json(ctx context.Request) {
	ani, ok := read_json[Animal](ctx)
	if !ok {
		panic("err on parse json")
	}
	write_json(ctx, ani)
}
