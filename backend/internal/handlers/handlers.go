package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/do2024-2047/CalenDO/internal/models"
	"github.com/do2024-2047/CalenDO/internal/repository"
	"github.com/gorilla/mux"
)

var (
	// eventRepo is the event repository used for database operations
	eventRepo *repository.EventRepository
)

// InitializeHandlers initializes the handlers with dependencies
func InitializeHandlers(er *repository.EventRepository) {
	eventRepo = er
}

// RegisterRoutes sets up all API routes
func RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/api/health", HealthCheckHandler).Methods("GET")
	r.HandleFunc("/api/events", GetEventsHandler).Methods("GET")
	r.HandleFunc("/api/events/{uid}", GetEventHandler).Methods("GET")
}

// HealthCheckHandler godoc
// @Summary Get API health status
// @Description Check if the API is up and running
// @Tags health
// @Produce json
// @Success 200 {object} map[string]string
// @Router /api/health [get]
func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status": "ok",
		"time":   time.Now().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetEventsHandler godoc
// @Summary Get all events
// @Description Retrieve all calendar events
// @Tags events
// @Produce json
// @Success 200 {array} models.EventResponse
// @Failure 500 {object} string "Internal server error"
// @Router /api/events [get]
func GetEventsHandler(w http.ResponseWriter, r *http.Request) {
	events, err := eventRepo.FindAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Convert to response format
	var responses []models.EventResponse
	for _, event := range events {
		responses = append(responses, event.ToResponse())
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(responses)
}

// GetEventHandler godoc
// @Summary Get a specific event
// @Description Get a calendar event by its UID
// @Tags events
// @Produce json
// @Param uid path string true "Event UID"
// @Success 200 {object} models.EventResponse
// @Failure 404 {object} string "Event not found"
// @Failure 500 {object} string "Internal server error"
// @Router /api/events/{uid} [get]
func GetEventHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventUID := vars["uid"]

	event, err := eventRepo.FindByID(eventUID)
	if err == repository.ErrNotFound {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(event.ToResponse())
}
