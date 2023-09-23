package main

import (
	"_/context"
	"_/handles"
	"fmt"
	"net/http"
)

const port = 6666

func main() {
	fmt.Println("\n\nfile bridge (golang) starting")
	app_context := context.New_app()
	for path, handler := range handles.All_handle() {
		fmt.Println("route:", path, handler)
		http.HandleFunc(path, func(res http.ResponseWriter, req *http.Request) {
			handle, ok := handler[req.Method]
			if ok {
				handle(context.New_request(res, req, app_context))
			} else {
				fmt.Println("404")
			}
		})
	}
	fmt.Printf("listening on %d\n\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Println("stopped on error: ", err)
	}
	fmt.Println("stopped")
}
