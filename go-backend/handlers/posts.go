package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go-backend/models"
	"go-backend/utils"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// @Summary Get all posts
// @Description Returns a list of all blog posts
// @Tags posts
// @Produce json
// @Success 200 {array} models.Post
// @Router /posts [get]
func GetPosts(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    cursor, err := utils.MongoDB.Collection("posts").Find(ctx, bson.M{})
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    var posts []models.Post
    if err := cursor.All(ctx, &posts); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(posts)
}

// @Summary Create a new post
// @Description Accepts a post object and creates it
// @Tags posts
// @Accept json
// @Produce json
// @Param post body models.Post true "Post to create"
// @Success 200 {object} models.Post
// @Router /posts [post]
func CreatePost(w http.ResponseWriter, r *http.Request) {
    var post models.Post
    if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    post.ID = primitive.NewObjectID()
    post.CreatedAt = time.Now()
    post.UpdatedAt = time.Now()

    _, err := utils.MongoDB.Collection("posts").InsertOne(context.Background(), post)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/json; charset=utf-8")
    json.NewEncoder(w).Encode(post)
}

// @Summary Update a post
// @Description Accepts a post object and updates it
// @Tags posts
// @Accept json
// @Produce json
// @Param id path string true "Post ID"
// @Param post body models.Post true "Post to update"
// @Success 200 {object} models.Post
// @Router /posts/{id} [put]
func UpdatePost(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]

    objID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        http.Error(w, "Invalid ID", http.StatusBadRequest)
        return
    }

    var post models.Post
    if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    post.ID = objID
    post.UpdatedAt = time.Now()

    _, err = utils.MongoDB.Collection("posts").UpdateOne(context.Background(), bson.M{"_id": objID}, bson.M{"$set": post})
    if err != nil {
        http.Error(w, "Failed to update", http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json; charset=utf-8")

    json.NewEncoder(w).Encode(post)
}   

// @Summary Delete a post
// @Description Deletes a post by ID
// @Tags posts
// @Param id path string true "Post ID"
// @Success 204 "No Content"
// @Failure 400 "Bad Request"
// @Failure 500 "Internal Server Error"
// @Produce json        
// @Router /posts/{id} [delete]
func DeletePost(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]

    objID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        http.Error(w, "Invalid ID", http.StatusBadRequest)
        return
    }

    _, err = utils.MongoDB.Collection("posts").DeleteOne(context.Background(), bson.M{"_id": objID})
    if err != nil {
        http.Error(w, "Failed to delete", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

// @Summary Get a post by ID
// @Description Returns a single post by ID
// @Tags posts
// @Param id path string true "Post ID"
// @Produce json
// @Success 200 {object} models.Post
// @Failure 404 "Not Found"
// @Failure 500 "Internal Server Error"
// @Router /posts/{id} [get]
func GetPostByID(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]

    objID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        http.Error(w, "Invalid ID", http.StatusBadRequest)
        return
    }

    var post models.Post
    err = utils.MongoDB.Collection("posts").FindOne(context.Background(), bson.M{"_id": objID}).Decode(&post)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            http.Error(w, "Post not found", http.StatusNotFound)
        } else {
            http.Error(w, err.Error(), http.StatusInternalServerError)
        }
        return
    }

    w.Header().Set("Content-Type", "application/json; charset=utf-8")

    json.NewEncoder(w).Encode(post)
}
