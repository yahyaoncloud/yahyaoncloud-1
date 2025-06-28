package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go-backend/models"
	"go-backend/utils" // ✅ Make sure this is imported

	"go.mongodb.org/mongo-driver/bson"
)

// GetPortfolio godoc
// @Summary      Get portfolio
// @Description  Returns the portfolio data
// @Tags         portfolio
// @Produce      json
// @Success      200  {object}  models.Portfolio
// @Failure      404  {object}  map[string]string
// @Router       /portfolio [get]
func GetPortfolio(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var portfolio models.Portfolio

    err := utils.PortfolioCollection.FindOne(ctx, bson.M{}).Decode(&portfolio)
	if err != nil {
		http.Error(w, `{"error":"Portfolio not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(portfolio)
}

// UpdatePortfolio godoc
// @Summary      Update portfolio
// @Description  Update a portfolio by ID
// @Tags         portfolio
// @Accept       json
// @Produce      json
// @Param        portfolio  body      models.Portfolio true  "Portfolio data"
// @Success      200        {object}  models.Portfolio
// @Failure      400        {object}  map[string]string
// @Router       /portfolio [put]
func UpdatePortfolio(w http.ResponseWriter, r *http.Request) {
	var portfolio models.Portfolio
	if err := json.NewDecoder(r.Body).Decode(&portfolio); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(portfolio)
}
