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

// EnsureTagIDs assigns TagID to tags that are missing it
func EnsureTagIDs(ctx context.Context) error {
	cursor, err := utils.MongoDB.Collection("tags").Find(ctx, bson.M{"tagID": bson.M{"$exists": false}})
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var tags []models.Tag
	if err := cursor.All(ctx, &tags); err != nil {
		return err
	}

	for _, tag := range tags {
		tagID, err := utils.GenerateTagID(ctx)
		if err != nil {
			return err
		}
		_, err = utils.MongoDB.Collection("tags").UpdateOne(
			ctx,
			bson.M{"_id": tag.ID},
			bson.M{"$set": bson.M{"tagID": tagID}},
		)
		if err != nil {
			return err
		}
	}
	return nil
}


// GetTags godoc
// @Summary      Get all tags
// @Description  Returns a list of all blog tags
// @Tags         tags
// @Produce      json
// @Success      200  {array}   models.Tag
// @Failure      500  {object}  map[string]string
// @Router       /tags [get]
func GetTags(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := utils.MongoDB.Collection("tags").Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var tags []models.Tag
	if err := cursor.All(ctx, &tags); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(tags)
}

// CreateTag godoc
// @Summary      Create tag or list of tags
// @Description  Accepts a single tag object or an array of tag objects for bulk insert
// @Tags         tags
// @Accept       json
// @Produce      json
// @Param        tags  body  []models.Tag  true  "List of tags or single tag"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /tags [post]
func CreateTag(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	count, err := utils.MongoDB.Collection("tags").CountDocuments(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Failed to count existing tags", http.StatusInternalServerError)
		return
	}

	var raw json.RawMessage
	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	var multiple []models.Tag
	if err := json.Unmarshal(raw, &multiple); err == nil {
		var docs []interface{}
		for i := range multiple {
			multiple[i].ID = primitive.NewObjectID()
			multiple[i].TagID = fmt.Sprintf("%d", count+int64(i)+1)
			docs = append(docs, multiple[i])
		}

		_, err := utils.MongoDB.Collection("tags").InsertMany(ctx, docs)
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

	var single models.Tag
	if err := json.Unmarshal(raw, &single); err == nil {
		single.ID = primitive.NewObjectID()
		single.TagID = fmt.Sprintf("%d", count+1)

		_, err = utils.MongoDB.Collection("tags").InsertOne(ctx, single)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(single)
		return
	}

	http.Error(w, "Invalid tag format", http.StatusBadRequest)
}


// UpdateTag godoc
// @Summary      Update a tag
// @Description  Updates an existing blog tag
// @Tags         tags
// @Accept       json
// @Produce      json
// @Param        id   query     string     true  "Tag ID"
// @Param        tag  body      models.Tag true  "Updated tag object"
// @Success      200  {object}  models.Tag
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /tags [put]
func UpdateTag(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	objID, _ := primitive.ObjectIDFromHex(id)

	ctx := context.Background()

	var update models.Tag
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var existing models.Tag
	err := utils.MongoDB.Collection("tags").FindOne(ctx, bson.M{"_id": objID}).Decode(&existing)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if update.TagID == "" {
		if existing.TagID == "" {
			update.TagID = fmt.Sprintf("%d", time.Now().UnixNano()) // fallback
		} else {
			update.TagID = existing.TagID
		}
	}

	_, err = utils.MongoDB.Collection("tags").UpdateOne(
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

// DeleteTag godoc
// @Summary      Delete a tag
// @Description  Deletes a tag by ID
// @Tags         tags
// @Produce      json
// @Param        id   query     string  true  "Tag ID"
// @Success      200  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /tags [delete]
func DeleteTag(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	objID, _ := primitive.ObjectIDFromHex(id)

	_, err := utils.MongoDB.Collection("tags").DeleteOne(context.Background(), bson.M{"_id": objID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}
