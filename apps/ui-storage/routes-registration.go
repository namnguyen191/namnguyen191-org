package main

import (
	"namnguyen191/uistorage/routes"

	"github.com/gin-gonic/gin"
)

func RegisterAllRoutes(r *gin.Engine) {
	layoutRoutes := routes.NewLayoutRoutes(&App.LayoutsRepo)
	layoutRoutes.RegisterLayoutRoutes(r)

	uiElementTemplateRoutes := routes.NewUIElementTemplateRoutes(&App.UIElementTemplatesRepo)
	uiElementTemplateRoutes.RegisterUIElementTemplateRoutes(r)

	remoteResourceRoutes := routes.NewRemoteResourceRoutes(&App.RemoteResourcesRepo)
	remoteResourceRoutes.RegisterRemoteResourceRoutes(r)
}
