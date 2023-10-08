package handles

import (
	"_/utils"
	"io"
)

func read_json[Result any](ctx request) (Result, bool) {
	var result Result
	body_str, err := io.ReadAll(ctx.req.Body)
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

func write_json(ctx request, result any) int {
	res_str, err := utils.Json_stringify(result)
	if err != nil {
		return WRITE_JSON_ERR_STRINGIFY
	}

	_, err = io.WriteString(ctx.res, res_str)
	if err == nil {
		return WRITE_JSON_ERR_WRITE
	}

	return WRITE_JSON_SUCCESS
}
