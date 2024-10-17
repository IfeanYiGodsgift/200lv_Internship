package models

type OrderItem struct {
	ProductID string `json:"product_id" bson:"product_id"`
	Quantity  int    `json:"quantity" bson:"quantity"`
}

type Order struct {
	ID        string      `json:"id" bson:"_id,omitempty"`
	Items     []OrderItem `json:"items" bson:"items"`
	UserID    string      `json:"user_id" bson:"user_id"`
	Total     float64     `json:"total" bson:"total"`
	Status    string      `json:"status" bson:"status"`
	CreatedAt int64       `json:"created_at" bson:"created_at"`
}
