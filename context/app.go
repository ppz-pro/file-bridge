package context

import (
	"net/http"
	"text/template"
)

type Webpage struct {
	Lang  string
	Title string
	Body  string
}

type App struct {
	Render func(res http.ResponseWriter, data Webpage) error
}

func New_app() App {
	tmpl := template.Must(template.ParseFiles("context/layout.html"))
	return App{
		func(res http.ResponseWriter, data Webpage) error {
			return tmpl.Execute(res, data)
		},
	}
}
