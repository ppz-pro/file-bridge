package handles

import (
	"_/context"
	"_/utils/map2"
	"fmt"
	"net/http"
)

type _handle func(context.Request)
type _restful map[string]_handle      // request.method => handle
type _all_handles map[string]_restful // request.path => restful

const GET = http.MethodGet
const POST = http.MethodPost

func Collect() {
	handles := _all_handles{
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

	map2.Arm(handles).Each(func(restful _restful, path string) {
		fmt.Println("route:", path, restful)
		http.HandleFunc(path, func(res http.ResponseWriter, req *http.Request) {
			fmt.Printf("[received request: %s %s][matched: %s]\n", req.Method, req.URL.Path, path)
			handle, ok := restful[req.Method]
			if !ok {
				handle = handle_404
			}
			handle(context.New_request(res, req, app_context))
		})
	})
}

func handle_404(ctx context.Request) {
	fmt.Println("404", ctx.Req.Method, ctx.Req.URL.Path)
	ctx.Res.WriteHeader(404)
	ctx.Res.Write([]byte("invalid request"))
}
