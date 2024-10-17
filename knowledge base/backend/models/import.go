package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Import represents a file imported into the knowledge base
type Import struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FileName   string             `bson:"file_name" json:"file_name"`
	Location   string             `bson:"location" json:"location"`
	Tags       string             `bson:"tags" json:"tags"`
	FileType   string             `bson:"file_type" json:"file_type"`
	Data       []byte             `bson:"data" json:"data"`
	Resolution *string            `bson:"resolution,omitempty" json:"resolution,omitempty"`
	Duration   *string            `bson:"duration,omitempty" json:"duration,omitempty"`
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
}
