package handles

import (
	"_/context"
	"_/utils"
	"io"
)

type Animal struct {
	Name string
	Year int
}

func test_json(ctx context.Request) {
	posted, err := io.ReadAll(ctx.Req.Body)
	if err != nil {
		panic(err)
	}

	ani, err := utils.Json_parse[Animal](string(posted))
	if err != nil {
		panic(err)
	}

	ani_str, err := utils.Json_stringify(ani)
	if err != nil {
		panic(err)
	}
	io.WriteString(ctx.Res, ani_str)
}
