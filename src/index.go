package main

import (
	"github.com/ppz-pro/file-bridge/tree/go/src/handler"
	"github.com/ppz-pro/file-bridge/tree/go/src/ppz"
)

func main() {
	server := ppz.Make_server()
	mh_map := server.Make_router("/provider")
	mh_map["GET"] = handler.Page_provider
	server.Start(6666)
}
