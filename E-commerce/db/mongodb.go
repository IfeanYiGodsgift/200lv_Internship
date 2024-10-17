package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func ConnectDB() *mongo.Client {
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")

	client, err := mongo.NewClient(clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}

	Client = client
	log.Println("Connected to MongoDB!")
	return client
}

func GetCollection(collectionName string) *mongo.Collection {
	return Client.Database("ecommerce").Collection(collectionName)
}

// GetCartCollection returns the cart collection
func GetCartCollection() *mongo.Collection {
	return Client.Database("ecommerce").Collection("cart")
}

// GetOrderCollection returns the order collection
func GetOrderCollection() *mongo.Collection {
	return Client.Database("ecommerce").Collection("orders")
}
