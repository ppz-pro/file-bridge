package handles

const (
	NO_ERR = 0

	ERR_CODE_REQUEST_JSON   = 1001 // 1000+ common error
	ERR_CODE_REQUEST_QUERY  = 1002
	ERR_CODE_REQUEST_PARAMS = 1003

	ERR_CODE_WS_UPGRADE = 2001 // 2000+ websocket error

	ERR_CODE_JWT_SIGNING = 5001 // 5000+ business error
)
