package handles

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func collect_provider(engine *gin.Engine) {
	group := engine.Group("/provider")
	group.GET("/jwt", func(c *gin.Context) {
		token := jwt.NewWithClaims(
			jwt.SigningMethodHS256,
			jwt.MapClaims{
				"sub": uuid.NewString(),
				"iat": time.Now().Unix(),
			},
		)
		token_str, err := token.SignedString([]byte("omamimamiho"))
		if err == nil {
			respond_json(c, token_str)
		} else {
			slog.Error("error on signing token",
				"error", err,
			)
			respond_json_error(c, ERR_CODE_JWT_SIGNING)
		}
	})
}
