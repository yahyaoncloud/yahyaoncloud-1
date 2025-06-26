// @title YahyaOnCloud Blog API
// @version 1.0
// @description Backend APIs for Yahya's RemixJS Blog
// @host localhost:8080
// @BasePath /api

package main

import (
	_ "go-backend/docs"
	"log"
	"net/http"
	"os"

	httpSwagger "github.com/swaggo/http-swagger"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"go-backend/routes"
	"go-backend/utils"

	"github.com/rs/cors"
)

func main() {
    // Load environment variables from .env
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found — falling back to system env vars")
    }

    // Connect to MongoDB
    utils.ConnectDB()

    // Initialize router
    r := mux.NewRouter()

    // Register API routes
    routes.RegisterRoutes(r)

    // Get port from env or default to 8080
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("🚀 Server running at http://localhost:%s", port)

    // Register Swagger docs route before starting the server
    r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

    handler := cors.Default().Handler(r)
    log.Fatal(http.ListenAndServe(":"+port, handler))
}
