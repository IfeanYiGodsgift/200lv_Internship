package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Note struct { //creates a note struct for the note model
	ID            primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Title         string             `json:"title"`
	Content       string             `json:"content"`
	Tags          []string           `json:"tags"`
	CreatedAt     string             `json:"created_at"`
	FormattedDate string             `json:"formatted_date"`
}
