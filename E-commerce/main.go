package main

import (
	"ecommerce-api/db"
	"ecommerce-api/routes"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	client := db.ConnectDB()
	router := mux.NewRouter()
	routes.RegisterRoutes(router, client)
	log.Fatal(http.ListenAndServe(":8080", router))
}
