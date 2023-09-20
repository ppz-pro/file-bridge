package handler

import (
	"fmt"
	"net/http"
)

func Page_provider(res http.ResponseWriter, req *http.Request) {
	fmt.Println("respond provider page")
}
