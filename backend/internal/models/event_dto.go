package models

import (
	"time"
)

// EventInput represents the structure for creating or updating an event
type EventInput struct {
	Summary     string    `json:"summary"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
}

// EventResponse represents the response structure for an event
type EventResponse struct {
	UID          string    `json:"uid"`
	Summary      string    `json:"summary"`
	Description  string    `json:"description"`
	Location     string    `json:"location"`
	StartTime    time.Time `json:"start_time"`
	EndTime      time.Time `json:"end_time"`
	Created      time.Time `json:"created"`
	LastModified time.Time `json:"last_modified"`
}

// ToResponse converts an Event to EventResponse
func (e *Event) ToResponse() EventResponse {
	return EventResponse{
		UID:          e.UID,
		Summary:      e.Summary,
		Description:  e.Description,
		Location:     e.Location,
		StartTime:    e.StartTime,
		EndTime:      e.EndTime,
		Created:      e.Created,
		LastModified: e.LastModified,
	}
}
