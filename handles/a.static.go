package handles

import (
	"_/constant"
	"net/http"

	"github.com/gin-gonic/gin"
)

func collect_static(engine *gin.Engine) {
	engine.Static(constant.CLIENT_URI_PREFIX, "./front/public")
	engine.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusFound, constant.CLIENT_URI_PREFIX)
	})
}
