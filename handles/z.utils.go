package handles

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

func read_json[Result any](c *gin.Context) (Result, bool) {
	var result Result
	err := c.ShouldBindJSON(&result)
	if err != nil {
		slog.Debug(
			"error on parsing json in request",
			"msg", err.Error(),
		)
		respond_json(c, gin.H{
			"error": ERR_CODE_REQUEST_JSON,
		})
		return result, false
	}
	return result, true
}

func respond_json[Result any](c *gin.Context, result Result) {
	c.JSON(http.StatusOK, result)
}
