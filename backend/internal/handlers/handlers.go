package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

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
	// This would typically fetch from a database
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode([]map[string]interface{}{
		{
			"uid":           "1",
			"summary":       "Team Meeting",
			"description":   "Weekly team sync",
			"location":      "Conference Room A",
			"start_time":    "2025-05-28T09:00:00Z",
			"end_time":      "2025-05-28T10:00:00Z",
			"created":       "2025-05-27T09:00:00Z",
			"last_modified": "2025-05-27T09:00:00Z",
		},
	})
}

// CreateEventHandler creates a new event
func CreateEventHandler(w http.ResponseWriter, r *http.Request) {
	// This would typically insert into a database
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "created",
		"uid":    "2",
	})
}

// GetEventHandler returns a specific event by UID
func GetEventHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventUID := vars["uid"]

	// This would typically fetch from a database
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"uid":           eventUID,
		"summary":       "Team Meeting",
		"description":   "Weekly team sync",
		"location":      "Conference Room A",
		"start_time":    "2025-05-28T09:00:00Z",
		"end_time":      "2025-05-28T10:00:00Z",
		"created":       "2025-05-27T09:00:00Z",
		"last_modified": "2025-05-27T09:00:00Z",
	})
}

// UpdateEventHandler updates an existing event
func UpdateEventHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventUID := vars["uid"]

	// This would typically update in a database
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

	// This would typically delete from a database
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "deleted",
		"uid":    eventUID,
	})
}
