package ppz

import (
	"fmt"
	"net/http"
)

type _handle func(Request_context)
type _method_handle_map map[string]_handle       // request method => handler
type _path_mhm_map map[string]_method_handle_map // url path => request method => handler

type _server struct {
	router _path_mhm_map
}

func Make_server() _server {
	return _server{
		_path_mhm_map{},
	}
}

func (server _server) Make_router(path string) _method_handle_map {
	mhm := map[string]_handle{}
	server.router[path] = mhm
	return mhm
}

func (server _server) Start(port int) {
	for path, method_map := range server.router {
		http.HandleFunc(path, func(res http.ResponseWriter, req *http.Request) {
			handle, ok := method_map[req.Method]
			if ok {
				handle(make_request_context(res, req))
			} else {
				fmt.Println("404")
			}
		})
	}
	fmt.Printf("\n\nfile bridge (golang) starting on %d\n\n", port)
	http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
}
