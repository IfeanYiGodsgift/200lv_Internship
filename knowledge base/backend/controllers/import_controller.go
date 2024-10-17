package controllers

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"knowledge_base_backend/models"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var importCollection *mongo.Collection

// Initialize the MongoDB collection for imports
func init() {
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		panic(err)
	}
	err = client.Ping(context.Background(), nil)
	if err != nil {
		panic(err)
	}
	importCollection = client.Database("knowledgebase").Collection("imports")
}

// UploadFile handles file upload and saving to the database
func UploadFile(c *fiber.Ctx) error {
	// Retrieve the uploaded file
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "File upload failed",
		})
	}

	// Open the uploaded file
	fileContent, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to open uploaded file",
		})
	}
	defer fileContent.Close()

	// Read the file content into a buffer
	var buffer bytes.Buffer
	_, err = io.Copy(&buffer, fileContent)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read uploaded file",
		})
	}

	// Retrieve file metadata from request form
	tags := c.FormValue("tags", "")
	location := c.FormValue("location", "")
	filename := file.Filename

	// Determine file type
	ext := filepath.Ext(filename)
	fileType := "unknown"
	if ext == ".jpg" || ext == ".png" || ext == ".gif" {
		fileType = "image"
	} else if ext == ".mp4" || ext == ".avi" {
		fileType = "video"
	}

	// Set file properties accordingly
	var resolution *string
	var duration *string
	if fileType == "image" {
		res := "1920x1080" // Example resolution
		resolution = &res
	} else if fileType == "video" {
		dur := "3:00" // Example duration
		duration = &dur
	}

	// Create a new Import model instance
	importFile := models.Import{
		ID:         primitive.NewObjectID(),
		FileName:   filename,
		Location:   location,
		Tags:       tags,
		FileType:   fileType,
		Data:       buffer.Bytes(),
		Resolution: resolution,
		Duration:   duration,
		CreatedAt:  time.Now(),
	}

	// Insert the new file document into MongoDB
	_, err = importCollection.InsertOne(context.Background(), importFile)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save file to database",
		})
	}

	// Return success response
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "File uploaded successfully",
	})
}

// GetImports retrieves all imported files from the database
func GetImports(c *fiber.Ctx) error {
	// Find all import documents
	cursor, err := importCollection.Find(context.Background(), bson.M{})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve imports",
		})
	}
	defer cursor.Close(context.Background())

	// Deserialize documents into Import models
	var imports []models.Import
	if err := cursor.All(context.Background(), &imports); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse imports",
		})
	}

	// Return the list of imports
	return c.Status(fiber.StatusOK).JSON(imports)
}

// GetImport retrieves a single imported file by its ID
func GetImport(c *fiber.Ctx) error {
	// Parse ID parameter from the URL
	idParam := c.Params("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	// Find the import document by ID
	var importFile models.Import
	err = importCollection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&importFile)
	if err == mongo.ErrNoDocuments {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Import not found",
		})
	} else if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve import",
		})
	}

	// Return the import data
	return c.Status(fiber.StatusOK).JSON(importFile)
}

// DeleteImport deletes an imported file by its ID
func DeleteImport(c *fiber.Ctx) error {
	// Parse ID parameter from the URL
	idParam := c.Params("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	// Delete the import document from the database
	_, err = importCollection.DeleteOne(context.Background(), bson.M{"_id": id})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete import",
		})
	}

	// Return success response
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Import deleted successfully",
	})
}

// ExportImport handles exporting an imported file by its ID
func ExportImport(c *fiber.Ctx) error {
	// Parse ID parameter from the URL
	idParam := c.Params("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	// Find the import document by ID
	var importFile models.Import
	err = importCollection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&importFile)
	if err == mongo.ErrNoDocuments {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Import not found",
		})
	} else if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve import",
		})
	}

	// Define the file path for exporting
	filePath := fmt.Sprintf("./exports/%s", importFile.FileName)

	// Create the export directory if it doesn't exist
	if err := os.MkdirAll("./exports", os.ModePerm); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create export directory",
		})
	}

	// Write the file data to the specified path
	if err := os.WriteFile(filePath, importFile.Data, 0644); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to export file",
		})
	}

	// Return success response
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "File exported successfully",
	})
}
