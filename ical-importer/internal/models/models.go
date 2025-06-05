package models

import (
	"time"
)

// Planning represents a calendar planning instance
type Planning struct {
	ID          string    `json:"id" gorm:"primaryKey;column:id"`
	Name        string    `json:"name" gorm:"column:name;not null"`
	Description string    `json:"description" gorm:"column:description"`
	Color       string    `json:"color" gorm:"column:color;default:#3B82F6"`
	Created     time.Time `json:"created" gorm:"column:created;autoCreateTime"`
	Updated     time.Time `json:"updated" gorm:"column:updated;autoUpdateTime"`
	IsDefault   bool      `json:"is_default" gorm:"column:is_default;default:false"`
}

// TableName specifies the table name for the Planning model
func (Planning) TableName() string {
	return "plannings"
}

// Event represents a calendar event
type Event struct {
	UID          string    `json:"uid" gorm:"primaryKey;column:uid"`
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
