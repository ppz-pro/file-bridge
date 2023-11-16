package handles

import "github.com/gin-gonic/gin"

func read_json[Result any](c *gin.Context) (Result, bool) {
	var result Result
	err := c.ShouldBindJSON(&result)
	if err != nil {
		return result, false
	}
	return result, true
}
