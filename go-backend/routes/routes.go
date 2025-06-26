package routes

import (
	// "net/http"

	"go-backend/handlers"

	"github.com/gorilla/mux"
)

func RegisterRoutes(r *mux.Router) {
    api := r.PathPrefix("/api").Subrouter()

    //Posts
    api.HandleFunc("/posts/{id}", handlers.GetPostByID).Methods("GET")
    api.HandleFunc("/posts/{id}", handlers.UpdatePost).Methods("PUT")
    api.HandleFunc("/posts/{id}", handlers.DeletePost).Methods("DELETE")
    // api.HandleFunc("/posts/{id}/comments", handlers.GetPostComments).Methods("GET")
    // api.HandleFunc("/posts/{id}/comments", handlers.CreatePostComment).Methods("POST")
    // api.HandleFunc("/posts/{id}/like", handlers.LikePost).Methods("POST")
    // api.HandleFunc("/posts/{id}/unlike", handlers.UnlikePost).Methods("POST")   
    api.HandleFunc("/posts", handlers.GetPosts).Methods("GET")
    api.HandleFunc("/posts", handlers.CreatePost).Methods("POST")



    // Categories
    api.HandleFunc("/categories", handlers.GetCategories).Methods("GET")
    api.HandleFunc("/categories", handlers.CreateCategory).Methods("POST")
    api.HandleFunc("/categories", handlers.UpdateCategory).Methods("PUT")
    api.HandleFunc("/categories", handlers.DeleteCategory).Methods("DELETE")

    // Tags
    api.HandleFunc("/tags", handlers.GetTags).Methods("GET")
    api.HandleFunc("/tags", handlers.CreateTag).Methods("POST")
    api.HandleFunc("/tags", handlers.UpdateTag).Methods("PUT")
    api.HandleFunc("/tags", handlers.DeleteTag).Methods("DELETE")
}
