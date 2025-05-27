package models

import (
	"time"
)

// Event represents a calendar event
type Event struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// NewEvent creates a new event
func NewEvent(title, description string, startTime, endTime time.Time) *Event {
	now := time.Now()
	return &Event{
		Title:       title,
		Description: description,
		StartTime:   startTime,
		EndTime:     endTime,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}
