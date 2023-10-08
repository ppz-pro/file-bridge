package handles

import (
	"_/context"
)

type Animal struct {
	Name string `json:"name"`
	Year int    `json:"year"`
}

func test_json(ctx context.Request) int {
	ani, ok := Read_json[Animal](ctx)
	if !ok {
		return ERR_BAD_REQEUST
	}
	Write_json(ctx, ani)
	return END
}
