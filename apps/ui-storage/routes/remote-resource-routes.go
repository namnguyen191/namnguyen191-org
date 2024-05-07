package routes

import (
	"namnguyen191/uistorage/db"
	"namnguyen191/uistorage/models"
	"namnguyen191/uistorage/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

const BASE_REMOTE_RESOURCE_ROUTE = "/remote-resources"

type RemoteResourceRoutes struct {
	remoteResourcesRepo *db.RemoteResourcesRepo
}

func NewRemoteResourceRoutes(remoteResourcesRepo *db.RemoteResourcesRepo) *RemoteResourceRoutes {
	return &RemoteResourceRoutes{
		remoteResourcesRepo: remoteResourcesRepo,
	}
}

func (route *RemoteResourceRoutes) RegisterRemoteResourceRoutes(r *gin.Engine) {
	r.GET(BASE_REMOTE_RESOURCE_ROUTE, route.getAllRemoteResources)
	r.GET(BASE_REMOTE_RESOURCE_ROUTE+"/:id", route.getRemoteResourceById)
	r.POST(BASE_REMOTE_RESOURCE_ROUTE, route.createRemoteResource)
}

func (route *RemoteResourceRoutes) createRemoteResource(c *gin.Context) {
	var newRemoteResource models.RemoteResource

	err := c.ShouldBindJSON(newRemoteResource)

	if err != nil {
		utils.BadRequest(c, "Invalid RemoteResource")
		return
	}

	err = route.remoteResourcesRepo.InserRemoteResource(&newRemoteResource)
	if err != nil {
		utils.ServerError(c)
		return
	}
}

func (route *RemoteResourceRoutes) getAllRemoteResources(c *gin.Context) {
	RemoteResources, err := route.remoteResourcesRepo.GetAllRemoteResources()

	if err != nil {
		utils.ServerError(c)
		return
	}

	c.JSON(http.StatusOK, RemoteResources)
}

func (route *RemoteResourceRoutes) getRemoteResourceById(c *gin.Context) {
	id := c.Param("id")

	RemoteResource, err := route.remoteResourcesRepo.GetRemoteResourceById(id)

	if err != nil {
		utils.ServerError(c)
		return
	}

	if RemoteResource == nil {
		utils.NotFound(c, "No RemoteResource found with id: "+id)
		return
	}

	c.JSON(http.StatusOK, RemoteResource)
}
