package main

import (
	"_/handles"
	"fmt"
	"log/slog"
	"net/http"
)

const port = 7777

func main() {
	slog.Info("file bridge (golang) starting", "port", port)
	handles.Collect()
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		slog.Error("file bridge stopped", "error", err)
	}
	slog.Info("file bridge stopped")
}
