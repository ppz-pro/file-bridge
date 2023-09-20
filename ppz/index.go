package ppz

import (
	"fmt"
	"net/http"
)

type _Handle func(http.ResponseWriter, *http.Request) // handler
type _Method_handle_map map[string]_Handle            // request method => handler
type _Path_mhm_map map[string]_Method_handle_map      // url path => request method => handler

type _Server struct {
	router _Path_mhm_map
}

func Make_server() _Server {
	return _Server{
		_Path_mhm_map{},
	}
}

func (server _Server) Make_router(path string) _Method_handle_map {
	mhm := map[string]_Handle{}
	server.router[path] = mhm
	return mhm
}

func (server _Server) Start(port int) {
	for path, method_map := range server.router {
		http.HandleFunc(path, func(res http.ResponseWriter, req *http.Request) {
			handle, ok := method_map[req.Method]
			if ok {
				handle(res, req)
			} else {
				fmt.Println("404")
			}
		})
	}
	fmt.Printf("\n\nfile bridge (golang) starting on %d\n\n", port)
	http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
}
