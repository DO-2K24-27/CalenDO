package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/do2024-2047/CalenDO/internal/models"
	"github.com/do2024-2047/CalenDO/internal/repository"
	"github.com/gorilla/mux"
)

var (
	// planningRepo is the planning repository used for database operations
	planningRepo *repository.PlanningRepository
)

// InitializePlanningHandlers initializes the planning handlers with dependencies
func InitializePlanningHandlers(pr *repository.PlanningRepository) {
	planningRepo = pr
}

// GetPlanningsHandler godoc
// @Summary Get all plannings
// @Description Retrieve all calendar plannings
// @Tags plannings
// @Produce json
// @Success 200 {array} models.PlanningResponse
// @Failure 500 {object} string "Internal server error"
// @Router /api/plannings [get]
func GetPlanningsHandler(w http.ResponseWriter, r *http.Request) {
	plannings, err := planningRepo.FindAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Convert to response format
	var responses []models.PlanningResponse
	for _, planning := range plannings {
		responses = append(responses, planning.ToResponse())
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(responses)
}

// GetPlanningHandler godoc
// @Summary Get a specific planning
// @Description Get a calendar planning by its ID
// @Tags plannings
// @Produce json
// @Param id path string true "Planning ID"
// @Success 200 {object} models.PlanningResponse
// @Failure 404 {object} string "Planning not found"
// @Failure 500 {object} string "Internal server error"
// @Router /api/plannings/{id} [get]
func GetPlanningHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	planningID := vars["id"]

	planning, eventCount, err := planningRepo.FindByIDWithEventCount(planningID)
	if err == repository.ErrNotFound {
		http.Error(w, "Planning not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := planning.ToResponse()
	response.EventCount = int(eventCount)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GetDefaultPlanningHandler godoc
// @Summary Get the default planning
// @Description Get the default calendar planning
// @Tags plannings
// @Produce json
// @Success 200 {object} models.PlanningResponse
// @Failure 404 {object} string "No default planning found"
// @Failure 500 {object} string "Internal server error"
// @Router /api/plannings/default [get]
func GetDefaultPlanningHandler(w http.ResponseWriter, r *http.Request) {
	planning, err := planningRepo.GetDefault()
	if err == repository.ErrNotFound {
		http.Error(w, "No default planning found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(planning.ToResponse())
}
