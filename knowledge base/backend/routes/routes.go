package routes

import (
	"knowledge_base_backend/controllers"

	"github.com/gofiber/fiber/v2"
)

// SetupRoutes initializes the routes for the application
func SetupRoutes(app *fiber.App) {
	// Note routes
	app.Get("/notes", controllers.GetNotes)
	app.Get("/notes/:id", controllers.GetNote)
	app.Post("/notes", controllers.CreateNote)
	app.Put("/notes/:id", controllers.UpdateNote)
	app.Delete("/notes/:id", controllers.DeleteNote)
	app.Post("/notes/search", controllers.SearchNotes)
	app.Post("/notes/save-file/:id", controllers.SaveFile)

	// Import routes
	app.Post("/imports", controllers.UploadFile)
	app.Get("/imports", controllers.GetImports)
	app.Get("/imports/:id", controllers.GetImport)
	app.Delete("/imports/:id", controllers.DeleteImport)
	app.Post("/imports/:id/export", controllers.ExportImport)
}
