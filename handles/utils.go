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

const (
	WRITE_JSON_SUCCESS = iota
	WRITE_JSON_ERR_STRINGIFY
	WRITE_JSON_ERR_WRITE
)
func write_json(ctx context.Request, result any) int {
	res_str, err := utils.Json_stringify(result)
	if err != nil {
		return WRITE_JSON_ERR_STRINGIFY
	}

	_, err = io.WriteString(ctx.Res, res_str)
	if err == nil {
		return WRITE_JSON_ERR_WRITE
	}
	
	return WRITE_JSON_SUCCESS
}
