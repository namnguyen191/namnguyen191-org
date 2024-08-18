package routes

import (
	"fmt"
	"namnguyen191/uistorage/db"
	"namnguyen191/uistorage/models"
	"namnguyen191/uistorage/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

const BASE_LAYOUT_ROUTE = "/layouts"

type LayoutRoutes struct {
	layoutRepo *db.LayoutsRepo
}

func NewLayoutRoutes(layoutRepo *db.LayoutsRepo) *LayoutRoutes {
	return &LayoutRoutes{
		layoutRepo: layoutRepo,
	}
}

func (route *LayoutRoutes) RegisterLayoutRoutes(r *gin.Engine) {
	r.GET(BASE_LAYOUT_ROUTE, route.getAllLayouts)
	r.GET(BASE_LAYOUT_ROUTE+"/:id", route.getLayoutById)
	r.POST(BASE_LAYOUT_ROUTE, route.createLayout)
	r.PUT(BASE_LAYOUT_ROUTE, route.updateLayout)
}

func (route *LayoutRoutes) createLayout(c *gin.Context) {
	var newLayout models.Layout

	err := c.ShouldBindJSON(newLayout)

	if err != nil {
		utils.BadRequest(c, "Invalid layout")
		return
	}

	err = route.layoutRepo.InserLayout(&newLayout)
	if err != nil {
		utils.ServerError(c)
		return
	}
}

func (route *LayoutRoutes) updateLayout(c *gin.Context) {
	var updatedLayout models.Layout
	err := c.ShouldBindJSON(&updatedLayout)

	if err != nil {
		utils.BadRequest(c, "Invalid layout")
		return
	}

	existingLayout, err := route.layoutRepo.GetLayoutById(*updatedLayout.Id)
	if err != nil {
		utils.ServerError(c)
		return
	}

	if existingLayout == nil {
		utils.NotFound(c, "the layout you are trying to update cannot be found")
		return
	}

	err = route.layoutRepo.UpdateLayout(&updatedLayout)
	if err != nil {
		fmt.Println(err)
		utils.ServerError(c)
		return
	}
}

func (route *LayoutRoutes) getAllLayouts(c *gin.Context) {
	layouts, err := route.layoutRepo.GetAllLayouts()

	if err != nil {
		utils.ServerError(c)
		return
	}

	c.JSON(http.StatusOK, layouts)
}

func (route *LayoutRoutes) getLayoutById(c *gin.Context) {
	id := c.Param("id")

	layout, err := route.layoutRepo.GetLayoutById(id)

	if err != nil {
		utils.ServerError(c)
		return
	}

	if layout == nil {
		utils.NotFound(c, "No layout found with id: "+id)
		return
	}

	c.JSON(http.StatusOK, layout)
}
