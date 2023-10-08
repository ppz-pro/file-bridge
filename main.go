package main

import (
	"_/handles"
	"fmt"
	"net/http"

	"github.com/rs/zerolog/log"
)

const port = 7777

func main() {
	log.Info().Msgf("file bridge (golang) starting on %d", port)
	handles.Collect()
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		log.Error().Err(err).Msg("file bridge stopped on error")
	}
	log.Info().Msg("file bridge stopped")
}
