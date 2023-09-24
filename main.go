package main

import (
	"_/handles"
	"fmt"
	"net/http"
)

const port = 7777

func main() {
	fmt.Println("\n\n\nfile bridge (golang) starting")
	handles.Collect()
	fmt.Printf("listening on %d\n\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Println("stopped on error: ", err)
	}
	fmt.Println("stopped")
}
