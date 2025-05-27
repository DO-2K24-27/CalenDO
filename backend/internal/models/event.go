package models

import (
	"time"
)

// Event represents a calendar event
type Event struct {
	UID          string    `json:"uid"`
	Created      time.Time `json:"created"`
	LastModified time.Time `json:"last_modified"`
	StartTime    time.Time `json:"start_time"`
	EndTime      time.Time `json:"end_time"`
	Summary      string    `json:"summary"`
	Location     string    `json:"location"`
	Description  string    `json:"description"`
}

// NewEvent creates a new event
func NewEvent(summary, description, location string, startTime, endTime time.Time) *Event {
	now := time.Now()
	return &Event{
		Summary:      summary,
		Description:  description,
		Location:     location,
		StartTime:    startTime,
		EndTime:      endTime,
		Created:      now,
		LastModified: now,
	}
}
