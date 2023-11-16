package main

import (
	"_/handles"
	"fmt"
	"log/slog"
)

const port = 7777

func main() {
	slog.Info("file bridge (golang) starting", "port", port)
	run := handles.Collect()
	run(fmt.Sprintf(":%d", port))
}
