package main

import (
	"knowledge_base_backend/routes"
	"log"

	"github.com/gofiber/fiber/v2"
)

func main() {
	// Create a new Fiber app
	app := fiber.New()

	// Set up the routes
	routes.SetupRoutes(app) // Changed from DefineRoutes to SetupRoutes

	// Start the server on port 8080
	log.Fatal(app.Listen(":8080"))
}
