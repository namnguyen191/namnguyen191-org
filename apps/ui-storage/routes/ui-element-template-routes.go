package routes

import (
	"fmt"
	"namnguyen191/uistorage/db"
	"namnguyen191/uistorage/models"
	"namnguyen191/uistorage/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

const BASE_UI_ELEMENT_TEMPLATE_ROUTE = "/ui-element-templates"

type UIElementTemplateRoutes struct {
	uiElementTemplatesRepo *db.UIElementTemplatesRepo
}

func NewUIElementTemplateRoutes(uiElementTemplatesRepo *db.UIElementTemplatesRepo) *UIElementTemplateRoutes {
	return &UIElementTemplateRoutes{
		uiElementTemplatesRepo: uiElementTemplatesRepo,
	}
}

func (route *UIElementTemplateRoutes) RegisterUIElementTemplateRoutes(r *gin.Engine) {
	r.GET(BASE_UI_ELEMENT_TEMPLATE_ROUTE, route.getAllUIElementTemplates)
	r.GET(BASE_UI_ELEMENT_TEMPLATE_ROUTE+"/:id", route.getUIElementTemplateById)
	r.POST(BASE_UI_ELEMENT_TEMPLATE_ROUTE, route.createUIElementTemplate)
	r.PUT(BASE_UI_ELEMENT_TEMPLATE_ROUTE, route.updateUIElementTemplate)
}

func (route *UIElementTemplateRoutes) createUIElementTemplate(c *gin.Context) {
	var newUIElementTemplate models.UIElementTemplate

	err := c.BindJSON(&newUIElementTemplate)

	if err != nil {
		utils.BadRequest(c, "Invalid ui element template")
		return
	}

	insertedUIElementTemplate, err := route.uiElementTemplatesRepo.InserUIElementTemplate(&newUIElementTemplate)
	if err != nil {
		utils.ServerError(c)
		return
	}

	c.JSON(http.StatusOK, insertedUIElementTemplate)
}

func (route *UIElementTemplateRoutes) getAllUIElementTemplates(c *gin.Context) {
	uiElementTemplates, err := route.uiElementTemplatesRepo.GetAllUIElementTemplates()

	if err != nil {
		utils.ServerError(c)
		return
	}

	c.JSON(http.StatusOK, uiElementTemplates)
}

func (route *UIElementTemplateRoutes) getUIElementTemplateById(c *gin.Context) {
	id := c.Param("id")

	uiElementTemplate, err := route.uiElementTemplatesRepo.GetUIElementTemplateById(id)

	if err != nil {
		utils.ServerError(c)
		return
	}

	if uiElementTemplate == nil {
		utils.NotFound(c, "No ui element template found with id: "+id)
		return
	}

	c.JSON(http.StatusOK, uiElementTemplate)
}

func (route *UIElementTemplateRoutes) updateUIElementTemplate(c *gin.Context) {
	var updatedUIElementTemplate models.UIElementTemplate
	err := c.ShouldBindJSON(&updatedUIElementTemplate)

	if err != nil {
		utils.BadRequest(c, "Invalid UI element template")
		return
	}

	existingUIElementTemplate, err := route.uiElementTemplatesRepo.GetUIElementTemplateById(*updatedUIElementTemplate.Id)
	if err != nil {
		utils.ServerError(c)
		return
	}

	if existingUIElementTemplate == nil {
		utils.NotFound(c, "the UI element template you are trying to update cannot be found")
		return
	}

	updatedUIElementTemplate.CreatedAt = existingUIElementTemplate.CreatedAt

	err = route.uiElementTemplatesRepo.UpdateUIElementTemplate(&updatedUIElementTemplate)
	if err != nil {
		fmt.Println(err)
		utils.ServerError(c)
		return
	}

	c.JSON(http.StatusCreated, updatedUIElementTemplate)
}
