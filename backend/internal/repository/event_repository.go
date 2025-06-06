package repository

import (
	"errors"

	"github.com/do2024-2047/CalenDO/internal/database"
	"github.com/do2024-2047/CalenDO/internal/models"
	"gorm.io/gorm"
)

var (
	// ErrNotFound is returned when an event cannot be found
	ErrNotFound = errors.New("event not found")
	// ErrInvalidID is returned when an invalid ID is provided
	ErrInvalidID = errors.New("invalid event ID")
)

// EventRepository handles database operations for calendar events
type EventRepository struct{}

// NewEventRepository creates a new event repository
func NewEventRepository() *EventRepository {
	return &EventRepository{}
}

// FindAll returns all events
func (r *EventRepository) FindAll() ([]*models.Event, error) {
	var events []*models.Event

	result := database.DB.Preload("Planning").Order("start_time DESC").Find(&events)
	if result.Error != nil {
		return nil, result.Error
	}

	return events, nil
}

// FindByPlanningID returns all events for a specific planning
func (r *EventRepository) FindByPlanningID(planningID string) ([]*models.Event, error) {
	if planningID == "" {
		return nil, ErrInvalidID
	}

	var events []*models.Event
	result := database.DB.Preload("Planning").Where("planning_id = ?", planningID).Order("start_time DESC").Find(&events)
	if result.Error != nil {
		return nil, result.Error
	}

	return events, nil
}

// FindByID returns an event by its ID
func (r *EventRepository) FindByID(uid string) (*models.Event, error) {
	if uid == "" {
		return nil, ErrInvalidID
	}

	var event models.Event
	result := database.DB.Preload("Planning").Where("uid = ?", uid).First(&event)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, result.Error
	}

	return &event, nil
}

// FindByIDAndPlanningID returns an event by its ID and planning ID
func (r *EventRepository) FindByIDAndPlanningID(uid, planningID string) (*models.Event, error) {
	if uid == "" || planningID == "" {
		return nil, ErrInvalidID
	}

	var event models.Event
	result := database.DB.Preload("Planning").Where("uid = ? AND planning_id = ?", uid, planningID).First(&event)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, result.Error
	}

	return &event, nil
}

// InitTable initializes the events table if it doesn't exist
func (r *EventRepository) InitTable() error {
	return database.DB.AutoMigrate(&models.Event{})
}
