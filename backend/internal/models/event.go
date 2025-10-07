package models

import (
	"fmt"
	"time"
)

// Event represents a calendar event
type Event struct {
	ID           string    `json:"id" gorm:"primaryKey;column:id"`
	UID          string    `json:"uid" gorm:"column:uid;not null;index"`
	PlanningID   string    `json:"planning_id" gorm:"column:planning_id;not null;index"`
	Created      time.Time `json:"created" gorm:"column:created"`
	LastModified time.Time `json:"last_modified" gorm:"column:last_modified"`
	StartTime    time.Time `json:"start_time" gorm:"column:start_time"`
	EndTime      time.Time `json:"end_time" gorm:"column:end_time"`
	Summary      string    `json:"summary" gorm:"column:summary"`
	Location     string    `json:"location" gorm:"column:location"`
	Description  string    `json:"description" gorm:"column:description"`

	// Relationships
	Planning *Planning `json:"planning,omitempty" gorm:"foreignKey:PlanningID;references:ID"`
}

// TableName specifies the table name for the Event model
func (Event) TableName() string {
	return "events"
}

// GenerateEventID creates a unique event ID by combining UID and PlanningID
func GenerateEventID(uid, planningID string) string {
	return fmt.Sprintf("%s_%s", uid, planningID)
}
