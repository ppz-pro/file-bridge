package handles

import (
	"fmt"
	"net/http"
)

type _handle func(request) int
type _handles map[string]_handle      // request.method => handle
type _all_handles map[string]_handles // request.path => _handles

const GET = http.MethodGet
const POST = http.MethodPost

const (
	END = iota
	ERR_BAD_REQEUST
)

func Collect() {
	all_handles := _all_handles{
		"/": {
			GET: func(ctx request) int {
				if ctx.req.URL.Path == "/" {
					return page_provider(ctx)
				} else {
					return handle_404(ctx)
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
		fmt.Println("route:", path, handles)
		http.HandleFunc(path, func(res http.ResponseWriter, req *http.Request) {
			fmt.Printf("[received request: %s %s][matched: %s]\n", req.Method, req.URL.Path, path)
			handle, ok := handles[req.Method]
			if !ok {
				handle = handle_404
			}

			err_code := handle(new_request(res, req, app_context))
			switch err_code {
			case ERR_BAD_REQEUST:
				res.WriteHeader(500 - err_code)
			case END:
				// end, do nothing
			default:
				panic(fmt.Sprintf("unrecognized error code: %d", err_code))
			}
		})
	}
	for path, handles := range all_handles {
		// 避免闭包引起的变量作用域混乱
		add_handle(path, handles)
	}
}

func handle_404(ctx request) int {
	fmt.Println("404", ctx.req.Method, ctx.req.URL.Path)
	ctx.res.WriteHeader(404)
	ctx.res.Write([]byte("invalid request"))
	return END
}
