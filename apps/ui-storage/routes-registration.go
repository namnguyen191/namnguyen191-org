package main

import (
	"namnguyen191/uistorage/routes"

	"github.com/gin-gonic/gin"
)

func RegisterAllRoutes(r *gin.Engine) {
	layoutRoutes := routes.NewLayoutRoutes(&App.LayoutsRepo)
	layoutRoutes.RegisterLayoutRoutes(r)
}
