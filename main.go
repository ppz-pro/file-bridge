package main

import (
	"_/handles"
	"_/log"
	"fmt"
	"net/http"
)

const port = 7777

func main() {
	log.Info("file bridge (golang) starting")
	handles.Collect()
	log.Info("listening on", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		log.Bug("file bridge stopped on error", err)
	}
	log.Info("file bridge stopped")
}
