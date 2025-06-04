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

// PlanningResponse represents the response structure for a planning
type PlanningResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Color       string    `json:"color"`
	Created     time.Time `json:"created"`
	Updated     time.Time `json:"updated"`
	IsDefault   bool      `json:"is_default"`
	EventCount  int       `json:"event_count,omitempty"`
}

// ToResponse converts a Planning to PlanningResponse
func (p *Planning) ToResponse() PlanningResponse {
	return PlanningResponse{
		ID:          p.ID,
		Name:        p.Name,
		Description: p.Description,
		Color:       p.Color,
		Created:     p.Created,
		Updated:     p.Updated,
		IsDefault:   p.IsDefault,
	}
}
