package handles

import (
	"_/utils"
	"io"

	"github.com/rs/zerolog/log"
)

const (
	SUCCESS_READ_JSON = iota
	ERR_READ_JSON_READ
	ERR_READ_JSON_PARSE
)

func read_json[Result any](ctx request) (Result, int) {
	var result Result
	body_str, err := io.ReadAll(ctx.req.Body)
	if err != nil {
		return result, ERR_READ_JSON_READ
	}

	result, err = utils.Json_parse[Result](string(body_str))
	if err != nil {
		return result, ERR_READ_JSON_PARSE
	}

	return result, SUCCESS_READ_JSON
}

func read_json_end[Result any](ctx request) (Result, int) {
	result, code := read_json[Result](ctx)
	switch code {
	case ERR_READ_JSON_READ, ERR_READ_JSON_PARSE:
		return result, ERR_BAD_REQEUST
	case SUCCESS_READ_JSON:
		return result, END
	default:
		log.Warn().Msg("error on read json")
		return result, ERR_UNKNOWN
	}
}

const (
	SUCCESS_WRITE_JSON = iota
	ERR_WRITE_JSON_STRINGIFY
	ERR_WRITE_JSON_WRITE
)

func write_json(ctx request, result any) int {
	res_str, err := utils.Json_stringify(result)
	if err != nil {
		log.Error().
			Err(err).
			Msg("stringify on writing json")
		return ERR_WRITE_JSON_STRINGIFY
	}

	_, err = io.WriteString(ctx.res, res_str)
	if err != nil {
		log.Error().
			Err(err).
			Msg("write on writing json")
		return ERR_WRITE_JSON_WRITE
	}

	return SUCCESS_WRITE_JSON
}
func write_json_end(ctx request, result any) int {
	code := write_json(ctx, result)
	switch code {
	case ERR_WRITE_JSON_STRINGIFY, ERR_WRITE_JSON_WRITE:
		return ERR_UNKNOWN
	case SUCCESS_WRITE_JSON:
		return END
	default:
		log.Error().
			Int("code", code).
			Msg("unknown code on writing json")
		return ERR_UNKNOWN
	}
}
