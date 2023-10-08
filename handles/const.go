package handles

import (
	"net/http"
)

const SUCCESS = 0
const (
	// 已处理
	END = iota
	// 客户端错误
	ERR_BAD_REQEUST
	// 服务端错误
	ERR_SERVER_FLAG // 重新计数
	ERR_UNKNOWN
)

const GET = http.MethodGet
const POST = http.MethodPost
