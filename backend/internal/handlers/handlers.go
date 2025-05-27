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
	r.HandleFunc("/api/events", CreateEventHandler).Methods("POST")
	r.HandleFunc("/api/events/{uid}", GetEventHandler).Methods("GET")
	r.HandleFunc("/api/events/{uid}", UpdateEventHandler).Methods("PUT")
	r.HandleFunc("/api/events/{uid}", DeleteEventHandler).Methods("DELETE")
}

// HealthCheckHandler returns API status
func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status": "ok",
		"time":   time.Now().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetEventsHandler returns all events
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

// CreateEventHandler creates a new event
func CreateEventHandler(w http.ResponseWriter, r *http.Request) {
	var input models.EventInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create a new event from the input
	event := models.NewEvent(
		input.Summary,
		input.Description,
		input.Location,
		input.StartTime,
		input.EndTime,
	)

	// Save the event to the database
	if err := eventRepo.Create(event); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "created",
		"uid":    event.UID,
	})
}

// GetEventHandler returns a specific event by UID
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

// UpdateEventHandler updates an existing event
func UpdateEventHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventUID := vars["uid"]

	// Check if event exists
	existingEvent, err := eventRepo.FindByID(eventUID)
	if err == repository.ErrNotFound {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Parse the input
	var input models.EventInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update the existing event
	existingEvent.Summary = input.Summary
	existingEvent.Description = input.Description
	existingEvent.Location = input.Location
	existingEvent.StartTime = input.StartTime
	existingEvent.EndTime = input.EndTime

	// Save the updated event
	if err := eventRepo.Update(existingEvent); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "updated",
		"uid":    eventUID,
	})
}

// DeleteEventHandler removes an existing event
func DeleteEventHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventUID := vars["uid"]

	// Delete the event
	err := eventRepo.Delete(eventUID)
	if err == repository.ErrNotFound {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "deleted",
		"uid":    eventUID,
	})
}
