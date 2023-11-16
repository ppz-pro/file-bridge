package handles

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

func read_query[Result any](c *gin.Context) (Result, bool) {
	var result Result
	err := c.ShouldBindQuery(&result)
	if err != nil {
		slog.Debug(
			"error on parsing query in request",
			"msg", err.Error(),
		)

		respond_json_error(c, ERR_CODE_REQUEST_QUERY)
		return result, false
	}
	return result, true
}
func read_params[Result any](c *gin.Context) (*Result, bool) {
	result := new(Result)
	err := c.ShouldBindUri(result)
	if err != nil {
		slog.Debug(
			"error on parsing params in request",
			"msg", err.Error(),
		)
		respond_json_error(c, ERR_CODE_REQUEST_PARAMS)
		return result, false
	}
	return result, true
}

func read_json[Result any](c *gin.Context) (Result, bool) {
	var result Result
	err := c.ShouldBindJSON(&result)
	if err != nil {
		slog.Debug(
			"error on parsing json in request",
			"msg", err.Error(),
		)
		respond_json_error(c, ERR_CODE_REQUEST_JSON)
		return result, false
	}
	return result, true
}

func respond(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"error": NO_ERR,
	})
}

func respond_json(c *gin.Context, data any) {
	c.JSON(http.StatusOK, gin.H{
		"error": NO_ERR,
		"data":  data,
	})
}

func respond_json_error(c *gin.Context, err int) {
	c.JSON(http.StatusOK, gin.H{
		"error": err,
	})
}
