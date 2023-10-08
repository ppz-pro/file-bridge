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
	tmpl := template.Must(template.ParseFiles("handles/template/layout.html"))
	return app{
		func(res http.ResponseWriter, data webpage) error {
			return tmpl.Execute(res, data)
		},
	}
}
