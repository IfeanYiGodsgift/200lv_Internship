package controllers

import (
	"context"
	"fmt"
	"knowledge_base_backend/models"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var collection *mongo.Collection

// Initialize the MongoDB collection
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
	collection = client.Database("knowledgebase").Collection("notes")
}

// GetNotes retrieves all notes from the database
func GetNotes(c *fiber.Ctx) error {
	var notes []models.Note
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve notes",
		})
	}
	defer cursor.Close(context.Background())
	if err := cursor.All(context.Background(), &notes); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse notes",
		})
	}
	return c.JSON(notes)
}

// GetNote retrieves a single note by its ID
func GetNote(c *fiber.Ctx) error {
	id := c.Params("id")

	// Convert id string to MongoDB ObjectId
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var note models.Note
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&note)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Note not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve note",
		})
	}
	return c.JSON(note)
}

// CreateNote adds a new note to the database
func CreateNote(c *fiber.Ctx) error {
	var note models.Note
	if err := c.BodyParser(&note); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input",
		})
	}

	// Validation
	if note.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title is required",
		})
	}
	if note.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Content is required",
		})
	}
	if len(note.Title) > 100 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title cannot exceed 100 characters",
		})
	}

	// Default timestamps
	if note.CreatedAt == "" {
		note.CreatedAt = time.Now().Format(time.RFC3339)
	}
	if note.FormattedDate == "" {
		note.FormattedDate = time.Now().Format("January 2, 2006")
	}

	_, err := collection.InsertOne(context.Background(), note)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create note",
		})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Note created successfully",
	})
}

// UpdateNote modifies an existing note identified by its ID
func UpdateNote(c *fiber.Ctx) error {
	id := c.Params("id")

	// Convert id string to MongoDB ObjectId
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var updateData models.Note
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input",
		})
	}

	// Validation
	if updateData.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title is required",
		})
	}
	if updateData.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Content is required",
		})
	}
	if len(updateData.Title) > 100 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title cannot exceed 100 characters",
		})
	}

	filter := bson.M{"_id": objID}
	update := bson.M{
		"$set": bson.M{
			"title":          updateData.Title,
			"content":        updateData.Content,
			"tags":           updateData.Tags,
			"created_at":     updateData.CreatedAt,
			"formatted_date": time.Now().Format("January 2, 2006"),
		},
	}
	result, err := collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update note",
		})
	}
	if result.MatchedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Note not found",
		})
	}
	return c.JSON(fiber.Map{
		"message": "Note updated successfully",
	})
}

// DeleteNote removes a note from the database
func DeleteNote(c *fiber.Ctx) error {
	id := c.Params("id")

	// Convert id string to MongoDB ObjectId
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	filter := bson.M{"_id": objID}
	result, err := collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete note",
		})
	}
	if result.DeletedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Note not found",
		})
	}
	return c.JSON(fiber.Map{
		"message": "Note deleted successfully",
	})
}

// SearchNotes retrieves notes based on the search query from the request body
func SearchNotes(c *fiber.Ctx) error {
	// Define a struct to parse the search query from the request body
	type SearchQuery struct {
		Query string `json:"query"` // Query field will hold the search string
	}

	var searchQuery SearchQuery
	// Parse the incoming JSON request body into the SearchQuery struct
	if err := c.BodyParser(&searchQuery); err != nil {
		// If parsing fails, return a 400 Bad Request status with an error message
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check if the query field is empty
	if searchQuery.Query == "" {
		// If no query is provided, return a 400 Bad Request status with an error message
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Search query is required",
		})
	}

	// Create a filter for MongoDB to search across the title, content, and tags fields
	// The "$or" operator allows for matching any of the provided conditions
	filter := bson.M{
		"$or": []bson.M{
			{"title": bson.M{"$regex": searchQuery.Query, "$options": "i"}},   // Search in the title field
			{"content": bson.M{"$regex": searchQuery.Query, "$options": "i"}}, // Search in the content field
			{"tags": bson.M{"$regex": searchQuery.Query, "$options": "i"}},    // Search in the tags array
		},
	}

	// Execute the search query on the MongoDB collection
	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		// If the query execution fails, return a 500 Internal Server Error with an error message
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to perform search",
		})
	}
	defer cursor.Close(context.Background()) // Ensure the cursor is closed after processing

	var notes []models.Note
	// Parse all documents returned by the query into the notes slice
	if err := cursor.All(context.Background(), &notes); err != nil {
		// If parsing the results fails, return a 500 Internal Server Error with an error message
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse search results",
		})
	}

	// Return the found notes as a JSON response
	return c.JSON(notes)
}

// SaveFile handles saving a file specified by the note ID
func SaveFile(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		FileName string `json:"file_name"` // Changed from filename to file_name
		FilePath string `json:"file_path"` // New field for file location
	}

	// Parse the request body
	if err := c.BodyParser(&body); err != nil {
		statusCode := fiber.StatusBadRequest
		fmt.Printf("Status %d: Error - Invalid request body: %s\n", statusCode, err) // Log the error with status code
		return c.Status(statusCode).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validation
	if body.FileName == "" {
		statusCode := fiber.StatusBadRequest
		fmt.Printf("Status %d: Error - File name is required\n", statusCode) // Log the error with status code
		return c.Status(statusCode).JSON(fiber.Map{
			"error": "File name is required",
		})
	}
	if body.FilePath == "" {
		statusCode := fiber.StatusBadRequest
		fmt.Printf("Status %d: Error - File location is required\n", statusCode) // Log the error with status code
		return c.Status(statusCode).JSON(fiber.Map{
			"error": "File location is required",
		})
	}

	// Convert id string to MongoDB ObjectId
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		statusCode := fiber.StatusBadRequest
		fmt.Printf("Status %d: Error - Invalid ID format: %s\n", statusCode, err) // Log the error with status code
		return c.Status(statusCode).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var note models.Note
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&note)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			statusCode := fiber.StatusNotFound
			fmt.Printf("Status %d: Error - Note not found: %s\n", statusCode, err) // Log the error with status code
			return c.Status(statusCode).JSON(fiber.Map{
				"error": "Note not found",
			})
		}
		statusCode := fiber.StatusInternalServerError
		fmt.Printf("Status %d: Error - Failed to retrieve note: %s\n", statusCode, err) // Log the error with status code
		return c.Status(statusCode).JSON(fiber.Map{
			"error": "Failed to retrieve note",
		})
	}

	filePath := body.FilePath
	fileName := body.FileName
	fileExt := filepath.Ext(fileName)
	fullPath := filepath.Join(filePath, fileName)

	// Ensure the directory exists
	if err := os.MkdirAll(filepath.Dir(fullPath), os.ModePerm); err != nil {
		statusCode := fiber.StatusInternalServerError
		fmt.Printf("Status %d: Error - Failed to create directory: %s\n", statusCode, err) // Log the error with status code
		return c.Status(statusCode).JSON(fiber.Map{
			"error": "Failed to create directory",
		})
	}

	switch fileExt {
	case ".pdf":
		// Create .pdf file
		pdf := gofpdf.New("P", "mm", "A4", "")
		pdf.AddPage()
		pdf.SetFont("Arial", "", 12)
		pdf.MultiCell(0, 10, note.Content, "", "L", false)
		file, err := os.Create(fullPath)
		if err != nil {
			statusCode := fiber.StatusInternalServerError
			fmt.Printf("Status %d: Error - Failed to create .pdf file: %s\n", statusCode, err) // Log the error with status code
			return c.Status(statusCode).JSON(fiber.Map{
				"error": "Failed to create .pdf file",
			})
		}
		defer file.Close()
		if err := pdf.Output(file); err != nil {
			statusCode := fiber.StatusInternalServerError
			fmt.Printf("Status %d: Error - Failed to save .pdf file: %s\n", statusCode, err) // Log the error with status code
			return c.Status(statusCode).JSON(fiber.Map{
				"error": "Failed to save .pdf file",
			})
		}
	case ".txt":
		// Create .txt file
		file, err := os.Create(fullPath)
		if err != nil {
			statusCode := fiber.StatusInternalServerError
			fmt.Printf("Status %d: Error - Failed to create .txt file: %s\n", statusCode, err) // Log the error with status code
			return c.Status(statusCode).JSON(fiber.Map{
				"error": "Failed to create .txt file",
			})
		}
		defer file.Close()
		if _, err := file.WriteString(note.Content); err != nil {
			statusCode := fiber.StatusInternalServerError
			fmt.Printf("Status %d: Error - Failed to write to .txt file: %s\n", statusCode, err) // Log the error with status code
			return c.Status(statusCode).JSON(fiber.Map{
				"error": "Failed to write to .txt file",
			})
		}
	default:
		// For unknown file types, save them as is
		file, err := os.Create(fullPath)
		if err != nil {
			statusCode := fiber.StatusInternalServerError
			fmt.Printf("Status %d: Error - Failed to create file: %s\n", statusCode, err) // Log the error with status code
			return c.Status(statusCode).JSON(fiber.Map{
				"error": "Failed to create file",
			})
		}
		defer file.Close()
		if _, err := file.WriteString(note.Content); err != nil {
			statusCode := fiber.StatusInternalServerError
			fmt.Printf("Status %d: Error - Failed to write to file: %s\n", statusCode, err) // Log the error with status code
			return c.Status(statusCode).JSON(fiber.Map{
				"error": "Failed to write to file",
			})
		}
	}

	// Success message with the actual file name
	statusCode := fiber.StatusOK
	fmt.Printf("Status %d: %s has been saved to %s successfully\n", statusCode, fileName, fullPath)

	return c.Status(statusCode).JSON(fiber.Map{
		"message": fmt.Sprintf("%s has been saved to %s successfully", fileName, fullPath),
	})
}
