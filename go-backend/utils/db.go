package utils

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var MongoDB *mongo.Database
var PortfolioCollection *mongo.Collection // ✅ ADD THIS

func ConnectDB() {
    uri := os.Getenv("MONGO_URI")
    dbName := os.Getenv("MONGO_DB_NAME")

    clientOpts := options.Client().ApplyURI(uri)
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    client, err := mongo.Connect(ctx, clientOpts)
    if err != nil {
        log.Fatalf("MongoDB connection error: %v", err)
    }

    err = client.Ping(ctx, nil)
    if err != nil {
        log.Fatalf("MongoDB ping error: %v", err)
    }

    MongoClient = client
    MongoDB = client.Database(dbName)

    	PortfolioCollection = MongoDB.Collection("portfolio")


    log.Println("Connected to MongoDB:", dbName)
}
