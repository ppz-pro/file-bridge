package handles

import (
	"log/slog"

	"github.com/gin-gonic/gin"
)

func Collect() func(string) {
	engine := gin.Default()
	collect_test(engine)
	collect_static(engine)
	collect_provider(engine)

	return func(addr string) {
		err := engine.Run(addr)
		slog.Error(
			"error on gin engine",
			"err", err,
		)
	}
}
