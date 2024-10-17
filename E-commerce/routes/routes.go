package routes

import (
	"ecommerce-api/db"
	"ecommerce-api/handlers"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
)

func RegisterRoutes(router *mux.Router, client *mongo.Client) {
	db.Client = client
	router.HandleFunc("/products", handlers.GetProducts).Methods("GET")
	router.HandleFunc("/products/{id}", handlers.GetProduct).Methods("GET")
	router.HandleFunc("/products", handlers.CreateProduct).Methods("POST")
	router.HandleFunc("/products/{id}", handlers.UpdateProduct).Methods("PUT")
	router.HandleFunc("/products/{id}", handlers.DeleteProduct).Methods("DELETE")

	router.HandleFunc("/cart", handlers.AddItemToCart).Methods("POST")
	router.HandleFunc("/cart", handlers.GetCart).Methods("GET")
	router.HandleFunc("/cart/{id}", handlers.RemoveItemFromCart).Methods("DELETE")

	router.HandleFunc("/orders", handlers.PlaceOrder).Methods("POST")
	router.HandleFunc("/orders/{id}", handlers.GetOrder).Methods("GET")
	router.HandleFunc("/orders", handlers.GetOrders).Methods("GET")
	router.HandleFunc("/orders/{id}", handlers.DeleteOrder).Methods("DELETE")

}
