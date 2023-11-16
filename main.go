package main

import (
	"_/handles"
	"fmt"
	"log/slog"
	"os"

	"github.com/gin-gonic/gin"
)

const port = 7777

func main() {
	debug_mode()
	// production_mode()

	slog.Info("file bridge (golang) starting", "port", port)
	run := handles.Collect()
	run(fmt.Sprintf(":%d", port))
}

func debug_mode() {
	// slog 默认是 info mode
	slog.SetDefault(
		slog.New( // => *slog.Logger
			slog.NewJSONHandler( // => *slog.JSONHandler
				os.Stderr,
				&slog.HandlerOptions{
					Level: slog.LevelDebug,
				},
			),
		),
	)
}

func production_mode() {
	// gin 默认是 debug mode
	gin.SetMode(gin.ReleaseMode)
}
