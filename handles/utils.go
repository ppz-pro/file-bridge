package handles

import (
	"_/context"
	"_/utils"
	"io"
)

func read_json[Result any](ctx context.Request) (Result, bool) {
	var result Result
	body_str, err := io.ReadAll(ctx.Req.Body)
	if err != nil {
		return result, false
	}

	result, err = utils.Json_parse[Result](string(body_str))
	if err != nil {
		return result, false
	}

	return result, true
}

func write_json(ctx context.Request, result any) bool {
	res_str, err := utils.Json_stringify(result)
	if err != nil {
		return false
	}

	_, err = io.WriteString(ctx.Res, res_str)
	return err == nil
}
