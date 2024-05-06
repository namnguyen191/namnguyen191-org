package db

import (
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database
var conn *mongo.Client

func InitDB() {
	if err := godotenv.Load(".dev.env"); err != nil {
		log.Println("Missing .dev.env file")
	}

	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		log.Fatal("You must set your 'MONGODB_URI' environment variable. See\n\t https://www.mongodb.com/docs/drivers/go/current/usage-examples/#environment-variable")
	}

	var err error
	conn, err = mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		panic(err)
	}

	DB = conn.Database("ui-storage")
}

func CloseDB() {
	if err := conn.Disconnect(context.TODO()); err != nil {
		panic(err)
	}
}
