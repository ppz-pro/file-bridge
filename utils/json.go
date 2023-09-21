package utils

import (
	"encoding/json"
)

func Json_parse[Result any](str string) (Result, error) {
	var res Result
	err := json.Unmarshal([]byte(str), &res)
	return res, err
}

func Json_bytify(data any) ([]byte, error) {
	return json.Marshal(data)
}

func Json_stringify(data any) (string, error) {
	res, err := json.Marshal(data)
	return string(res), err
}
