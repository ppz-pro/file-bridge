package handles

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

func collect_test(engine *gin.Engine) {
	test := engine.Group("/test")

	test.GET("/hello", func(c *gin.Context) {
		slog.Info("say hello from client")
		c.String(http.StatusOK, "hello, I'm PPz!")
	})

	test.GET("/query", func() func(*gin.Context) {
		type test_query struct {
			Name string `form:"name"`
			Male bool   `form:"male"`
			Year int    `form:"year"`
		}

		return func(c *gin.Context) {
			query, ok := read_query[test_query](c)
			if !ok {
				return
			}
			slog.Info("received query",
				"query", query,
			)
			respond(c)
		}
	}())

	test.POST("/json", func() func(*gin.Context) {
		type test_JSON struct {
			Name string `json:"name"`
			Tel  string `json:"tel"`
			Year int    `json:"year"`
		}

		return func(c *gin.Context) {
			data, ok := read_json[test_JSON](c)
			if !ok {
				return
			}
			slog.Info("received json",
				"data", data,
			)
			respond_json(c, gin.H{
				"name": "PPz",
				"year": 3,
			})
		}
	}())
}
