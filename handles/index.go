package handles

import (
	"_/context"
	"fmt"
	"net/http"
)

type _handle func(context.Request)
type _handles map[string]_handle      // request.method => handle
type _all_handles map[string]_handles // request.path => _handles

const GET = http.MethodGet
const POST = http.MethodPost

func Collect() {
	all_handles := _all_handles{
		"/": {
			GET: func(ctx context.Request) {
				if ctx.Req.URL.Path == "/" {
					page_provider(ctx)
				} else {
					handle_404(ctx)
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

	app_context := context.New_app()

	add_handle := func(path string, handles _handles) {
		fmt.Println("route:", path, handles)
		http.HandleFunc(path, func(res http.ResponseWriter, req *http.Request) {
			fmt.Printf("[received request: %s %s][matched: %s]\n", req.Method, req.URL.Path, path)
			handle, ok := handles[req.Method]
			if !ok {
				handle = handle_404
			}
			handle(context.New_request(res, req, app_context))
		})
	}
	for path, handles := range all_handles {
		add_handle(path, handles)
	}
}

func handle_404(ctx context.Request) {
	fmt.Println("404", ctx.Req.Method, ctx.Req.URL.Path)
	ctx.Res.WriteHeader(404)
	ctx.Res.Write([]byte("invalid request"))
}
