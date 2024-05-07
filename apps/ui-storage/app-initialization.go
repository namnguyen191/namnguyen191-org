package main

import (
	"namnguyen191/uistorage/db"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type AppConfig struct {
	LayoutsRepo            db.LayoutsRepo
	UIElementTemplatesRepo db.UIElementTemplatesRepo
	RemoteResourcesRepo    db.RemoteResourcesRepo
	server                 *gin.Engine
}

var App AppConfig

func initApp() {
	db.InitDB()

	RegisterAllRepos()

	App.server = gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}
	App.server.Use(cors.New(config))

	RegisterAllRoutes(App.server)
}

func cleanUpApp() {
	db.CloseDB()
}
