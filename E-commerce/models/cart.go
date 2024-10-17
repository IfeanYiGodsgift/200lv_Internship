package models

type CartItem struct {
	ProductID string `json:"product_id" bson:"product_id"`
	Quantity  int    `json:"quantity" bson:"quantity"`
}

type Cart struct {
	ID     string     `json:"id" bson:"_id,omitempty"`
	Items  []CartItem `json:"items" bson:"items"`
	UserID string     `json:"user_id" bson:"user_id"`
}
