package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func BadRequest(c *gin.Context, msg string) {
	c.JSON(http.StatusBadRequest, gin.H{"error": msg})
}

func ServerError(c *gin.Context) {
	c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong. Please try again later."})
}

func NotFound(c *gin.Context, msg string) {
	c.JSON(http.StatusNotFound, gin.H{"error": msg})
}
