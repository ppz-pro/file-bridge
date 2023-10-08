package handles

import (
	"net/http"

	"github.com/rs/zerolog/log"
)

type _handle func(request) int
type _handles map[string]_handle      // request.method => handle
type _all_handles map[string]_handles // request.path => _handles

func Collect() {
	all_handles := _all_handles{
		"/": {
			GET: func(ctx request) int {
				if ctx.req.URL.Path == "/" {
					return page_provider(ctx)
				} else {
					return _handle_404(ctx)
				}
			},
		},
		"/provider": {
			GET: page_provider,
		},
		"/test/json": {
			POST: test_json,
		},
	}

	app_context := new_app()

	add_handle := func(path string, handles _handles) {
		log.Info().
			Str("path", path).
			Strs("method", _methods(handles)).
			Msg("handle route")
		http.HandleFunc(path, func(res http.ResponseWriter, req *http.Request) {
			log.Debug().
				Str("matched", path).
				Str("method", req.Method).
				Str("path", req.URL.Path).
				Msg("request received")
			handle, ok := handles[req.Method]
			if !ok {
				handle = _handle_404
			}

			err_code := handle(new_request(res, req, app_context))
			switch err_code {
			case ERR_BAD_REQEUST:
				res.WriteHeader(500 - err_code)
			case ERR_UNKNOWN:
				res.WriteHeader(600 + ERR_SERVER_FLAG - err_code)
			case END:
				// end, do nothing
			default:
				log.Error().Int("code", err_code).Msg("unrecognized error code")
			}
		})
	}
	for path, handles := range all_handles {
		// 避免闭包引起的变量作用域混乱
		add_handle(path, handles)
	}
}

func _handle_404(ctx request) int {
	log.Info().
		Str("method", ctx.req.Method).
		Str("path", ctx.req.URL.Path).
		Msg("404")
	ctx.res.WriteHeader(404)
	ctx.res.Write([]byte("invalid request"))
	return END
}

func _methods(handles _handles) []string {
	var result []string
	for key := range handles {
		result = append(result, key)
	}
	return result
}
