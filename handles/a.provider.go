package handles

import (
	"_/config"
	"fmt"
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
		token_str, err := token.SignedString([]byte(config.Get_jwt_secret()))
		if err == nil {
			respond_json(c, token_str)
		} else {
			slog.Error("error on signing token",
				"error", err,
			)
			respond_json_error(c, ERR_CODE_JWT_SIGNING)
		}
	})

	auth_group := group.Group("", func(c *gin.Context) {
		tokens := c.Request.Header["Token"]
		if len(tokens) == 0 {
			respond_json_error(c, ERR_CODE_AUTH_NO_TOKEN)
			return
		}
		// parse and validate
		token, err := jwt.Parse(tokens[0], func(t *jwt.Token) (interface{}, error) {
			if t.Method != jwt.SigningMethodES256 {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Method)
			}
			return config.Get_jwt_secret(), nil
		})
		if err != nil {
			respond_json_error(c, ERR_CODE_AUTH_INVALID_TOKEN)
			return
		}
		provider_id, err := token.Claims.GetSubject()
		if err != nil {
			respond_json_error(c, ERR_CODE_AUTH_UNKNOWN)
			return
		}
		c.Set("provider_id", provider_id)
		c.Next()
	})

	auth_group.GET("/auth-test", func(c *gin.Context) {
		// 仅测试：无 token、或 token 格式不正确
		respond_json(c, c.GetString("provider_id"))
	})

	// provider_map := mng_connections(auth_group)
	mng_connections(auth_group)
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
