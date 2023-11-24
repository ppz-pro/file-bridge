package handles

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
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

	provider_map := mng_connections(group)
}

type request_file_from_downloader func(target_path string)
type provider_map map[string]request_file_from_downloader

func mng_connections(group *gin.RouterGroup) provider_map {
	provider_map := make(provider_map)

	upgrade_ws := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	group.GET("/conn", func(c *gin.Context) {
		conn, err := upgrade_ws.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			respond_json_error(c, ERR_CODE_WS_UPGRADE)
			return
		}
		conn.Close()
	})

	return provider_map
}
