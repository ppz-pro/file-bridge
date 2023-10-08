package handles

import (
	"net/http"
	"text/template"
)

type webpage struct {
	lang  string
	title string
	body  string
}

type app struct {
	render func(res http.ResponseWriter, data webpage) error
}

func new_app() app {
	tmpl, err := template.ParseFiles("handles/template/layout.html")
	if err != nil {
		panic("layout 模板解析失败")
	}
	return app{
		func(res http.ResponseWriter, data webpage) error {
			return tmpl.Execute(res, data)
		},
	}
}
