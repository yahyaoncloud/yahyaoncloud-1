package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go-backend/models"
	"go-backend/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// EnsureCatIDs assigns CatID to categories that are missing it
func EnsureCatIDs(ctx context.Context) error {
    cursor, err := utils.MongoDB.Collection("categories").Find(ctx, bson.M{"catId": bson.M{"$exists": false}})
    if err != nil {
        return err
    }
    defer cursor.Close(ctx)

    var categories []models.Category
    if err := cursor.All(ctx, &categories); err != nil {
        return err
    }

    for _, category := range categories {
        catID, err := utils.GenerateCatID(ctx)
        if err != nil {
            return err
        }
        _, err = utils.MongoDB.Collection("categories").UpdateOne(
            ctx,
            bson.M{"_id": category.ID},
            bson.M{"$set": bson.M{"catId": catID}},
        )
        if err != nil {
            return err
        }
    }
    return nil
}

// GetCategories godoc
// @Summary      Get all categories
// @Description  Returns a list of all blog categories
// @Tags         categories
// @Produce      json
// @Success      200  {array}   models.Category
// @Failure      500  {object}  map[string]string
// @Router       /categories [get]
func GetCategories(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    cursor, err := utils.MongoDB.Collection("categories").Find(ctx, bson.M{})
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    var categories []models.Category
    if err := cursor.All(ctx, &categories); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(categories)
}

// CreateCategory godoc
// @Summary      Create category or list of categories
// @Description  Accepts a single category object or an array of category objects for bulk insert
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        categories  body  []models.Category  true  "List of categories or single category"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /categories [post]
func CreateCategory(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    // Count existing categories ONCE for deterministic catID assignment
    count, err := utils.MongoDB.Collection("categories").CountDocuments(ctx, bson.M{})
    if err != nil {
        http.Error(w, "Failed to count existing categories", http.StatusInternalServerError)
        return
    }

    var raw json.RawMessage
    if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    // Handle array input
    var multiple []models.Category
    if err := json.Unmarshal(raw, &multiple); err == nil {
        var docs []interface{}
        for i := range multiple {
            multiple[i].ID = primitive.NewObjectID()
            multiple[i].CatID = fmt.Sprintf("%d", count+int64(i)+1)
            docs = append(docs, multiple[i])
        }

        _, err := utils.MongoDB.Collection("categories").InsertMany(ctx, docs)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        json.NewEncoder(w).Encode(map[string]interface{}{
            "inserted": len(docs),
            "data":     multiple,
        })
        return
    }

    // Handle single object input
    var single models.Category
    if err := json.Unmarshal(raw, &single); err == nil {
        single.ID = primitive.NewObjectID()
        single.CatID = fmt.Sprintf("%d", count+1)

        _, err := utils.MongoDB.Collection("categories").InsertOne(ctx, single)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        json.NewEncoder(w).Encode(single)
        return
    }

    http.Error(w, "Invalid category format", http.StatusBadRequest)
}

// UpdateCategory godoc
// @Summary      Update a category
// @Description  Updates an existing blog category
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        id        query     string           true  "Category ID"
// @Param        category  body      models.Category  true  "Updated category object"
// @Success      200       {object}  models.Category
// @Failure      400       {object}  map[string]string
// @Failure      500       {object}  map[string]string
// @Router       /categories [put]
func UpdateCategory(w http.ResponseWriter, r *http.Request) {
    id := r.URL.Query().Get("id")
    objID, _ := primitive.ObjectIDFromHex(id)

    var update models.Category
    if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Ensure CatID is preserved or assigned if missing
    ctx := context.Background()
    var existing models.Category
    err := utils.MongoDB.Collection("categories").FindOne(ctx, bson.M{"_id": objID}).Decode(&existing)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    if update.CatID == "" {
        if existing.CatID == "" {
            update.CatID, err = utils.GenerateCatID(ctx)
            if err != nil {
                http.Error(w, "Failed to generate category ID", http.StatusInternalServerError)
                return
            }
        } else {
            update.CatID = existing.CatID
        }
    }

    _, err = utils.MongoDB.Collection("categories").UpdateOne(
        ctx,
        bson.M{"_id": objID},
        bson.M{"$set": update},
    )
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(update)
}

// DeleteCategory godoc
// @Summary      Delete a category
// @Description  Deletes a category by ID
// @Tags         categories
// @Produce      json
// @Param        id   query     string  true  "Category ID"
// @Success      200  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /categories [delete]
func DeleteCategory(w http.ResponseWriter, r *http.Request) {
    id := r.URL.Query().Get("id")
    objID, _ := primitive.ObjectIDFromHex(id)

    _, err := utils.MongoDB.Collection("categories").DeleteOne(context.Background(), bson.M{"_id": objID})
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}