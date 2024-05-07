package main

import (
	"namnguyen191/uistorage/db"

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
	RegisterAllRoutes(App.server)
}

func cleanUpApp() {
	db.CloseDB()
}
