package utils

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
)

// GenerateCatID generates a numeric string ID based on the current count of categories
func GenerateCatID(ctx context.Context) (string, error) {
	count, err := MongoDB.Collection("categories").CountDocuments(ctx, bson.M{})
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%d", count+1), nil
}

// GenerateTagID generates a numeric string ID based on the current count of tags
func GenerateTagID(ctx context.Context) (string, error) {
	count, err := MongoDB.Collection("tags").CountDocuments(ctx, bson.M{})
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%d", count+1), nil
}
