package handler

import (
	"net/http"
	"text/template"
)

type webpage struct {
	Lang  string
	Title string
	Body  string
}

var tmpl = template.Must(template.ParseFiles("handler/template/layout.html"))

func render(res http.ResponseWriter, data webpage) error {
	return tmpl.Execute(res, data)
}
