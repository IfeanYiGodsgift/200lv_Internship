package handlers

import (
	"context"
	"ecommerce-api/db"
	"ecommerce-api/models"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
)

// AddItemToCart adds a product to the cart
func AddItemToCart(w http.ResponseWriter, r *http.Request) {
	var cartItem models.CartItem
	err := json.NewDecoder(r.Body).Decode(&cartItem)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	collection := db.GetCartCollection()
	_, err = collection.InsertOne(context.Background(), cartItem)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(cartItem)
}

// GetCart retrieves all items in the cart
func GetCart(w http.ResponseWriter, r *http.Request) {
	collection := db.GetCartCollection()
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var cartItems []models.CartItem
	if err = cursor.All(context.Background(), &cartItems); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cartItems)
}

// RemoveItemFromCart removes a product from the cart
func RemoveItemFromCart(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	collection := db.GetCartCollection()
	_, err := collection.DeleteOne(context.Background(), bson.M{"_id": id})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
