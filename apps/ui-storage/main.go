package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		dat, err := os.ReadFile("./assets/remote-resources/boredapi-remote-resource.json")

		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusOK, gin.H{
				"message": "error getting your shit",
			})
			return
		}

		fmt.Println(dat)

		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
