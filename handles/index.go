package handles

import (
	"net/http"
	"_/context"
)

type _handle func(context.Request)
type _restful map[string]_handle     // request.method => handle
type _all_handle map[string]_restful // request.path => restful

func All_handle() _all_handle {
	return _all_handle{
		"/provider": _restful{
			http.MethodGet: page_provider,
		},
	}
}
