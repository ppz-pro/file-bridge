package handler

import (
	"net/http"
)

func Page_provider(res http.ResponseWriter, req *http.Request) {
	render(res, webpage{"cn", "Provider", "hello"})
}
