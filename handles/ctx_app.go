package context

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

func New_app() App {
	tmpl := template.Must(template.ParseFiles("context/layout.html"))
	return App{
		func(res http.ResponseWriter, data Webpage) error {
			return tmpl.Execute(res, data)
		},
	}
}
