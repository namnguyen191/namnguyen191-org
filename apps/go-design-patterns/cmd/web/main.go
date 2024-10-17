package main

import (
	"flag"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"time"
)

const port = ":4000"

type application struct {
	templateCacheMap map[string]*template.Template
	config           appConfig
}

type appConfig struct {
	useTemplateCache bool
}

func main() {
	app := application{
		templateCacheMap: make(map[string]*template.Template),
	}

	flag.BoolVar(&app.config.useTemplateCache, "cache", false, "Use template cache")
	flag.Parse()

	srv := &http.Server{
		Addr:              port,
		Handler:           app.routes(),
		IdleTimeout:       30 * time.Second,
		ReadTimeout:       30 * time.Second,
		ReadHeaderTimeout: 30 * time.Second,
		WriteTimeout:      30 * time.Second,
	}

	fmt.Println("Starting application on port ", port)

	err := srv.ListenAndServe()
	if err != nil {
		log.Panic(err)
	}
}
