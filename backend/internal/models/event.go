package models

import (
	"time"
)

// Event represents a calendar event
type Event struct {
	UID          string    `json:"uid" gorm:"primaryKey;column:uid"`
	Created      time.Time `json:"created" gorm:"column:created"`
	LastModified time.Time `json:"last_modified" gorm:"column:last_modified"`
	StartTime    time.Time `json:"start_time" gorm:"column:start_time"`
	EndTime      time.Time `json:"end_time" gorm:"column:end_time"`
	Summary      string    `json:"summary" gorm:"column:summary"`
	Location     string    `json:"location" gorm:"column:location"`
	Description  string    `json:"description" gorm:"column:description"`
}

// TableName specifies the table name for the Event model
func (Event) TableName() string {
	return "calendar"
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
