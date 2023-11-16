package handles

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func collect_test(engine *gin.Engine) {
	test := engine.Group("/test")
	test.GET("/hello", func(c *gin.Context) {
		c.String(http.StatusOK, "hello, I'm PPz!")
	})
}
