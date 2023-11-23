package handles

import "github.com/gin-gonic/gin"

func collect_static(engine *gin.Engine) {
	engine.Static("/client", "./front/public")
}
