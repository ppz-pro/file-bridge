package handles

import (
	"_/context"
)

type Animal struct {
	Name string `json:"name"`
	Year int    `json:"year"`
}

func test_json(ctx context.Request) int {
	ani, ok := context.Read_json[Animal](ctx)
	if !ok {
		return ERR_BAD_REQEUST
	}
	context.Write_json(ctx, ani)
	return END
}
