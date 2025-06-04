package models

import (
	"time"
)

// EventResponse represents the response structure for an event
type EventResponse struct {
	UID          string            `json:"uid"`
	PlanningID   string            `json:"planning_id"`
	Summary      string            `json:"summary"`
	Description  string            `json:"description"`
	Location     string            `json:"location"`
	StartTime    time.Time         `json:"start_time"`
	EndTime      time.Time         `json:"end_time"`
	Created      time.Time         `json:"created"`
	LastModified time.Time         `json:"last_modified"`
	Planning     *PlanningResponse `json:"planning,omitempty"`
}

// ToResponse converts an Event to EventResponse
func (e *Event) ToResponse() EventResponse {
	response := EventResponse{
		UID:          e.UID,
		PlanningID:   e.PlanningID,
		Summary:      e.Summary,
		Description:  e.Description,
		Location:     e.Location,
		StartTime:    e.StartTime,
		EndTime:      e.EndTime,
		Created:      e.Created,
		LastModified: e.LastModified,
	}

	if e.Planning != nil {
		planningResponse := e.Planning.ToResponse()
		response.Planning = &planningResponse
	}

	return response
}
