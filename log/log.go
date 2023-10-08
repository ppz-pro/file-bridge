package log

import (
	"errors"
	"fmt"
	"log"
)

func Info(args ...any) {
	log.Println(args...)
}
func Infof(msg string, args ...any) {
	Info(fmt.Sprintf(msg, args...))
}

func Error(args ...any) {
	log.Println(
		append([]any{"error"}, args...),
	)
}

func Bug(msg string, debug ...any) {
	log.Println(errors.New(msg))
	if len(debug) > 0 {
		log.Println(append([]any{"debug error"}, debug...))
	}
}
