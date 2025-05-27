package repository

import (
	"errors"
	"time"

	"github.com/do2024-2047/CalenDO/internal/database"
	"github.com/do2024-2047/CalenDO/internal/models"
	"github.com/google/uuid"
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

	result := database.DB.Order("start_time DESC").Find(&events)
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
	result := database.DB.Where("uid = ?", uid).First(&event)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, result.Error
	}

	return &event, nil
}

// Create inserts a new event
func (r *EventRepository) Create(event *models.Event) error {
	if event.UID == "" {
		event.UID = uuid.New().String()
	}

	now := time.Now()
	event.Created = now
	event.LastModified = now

	result := database.DB.Create(event)
	return result.Error
}

// Update modifies an existing event
func (r *EventRepository) Update(event *models.Event) error {
	if event.UID == "" {
		return ErrInvalidID
	}

	// Update the last modified timestamp
	event.LastModified = time.Now()

	result := database.DB.Model(&models.Event{}).
		Where("uid = ?", event.UID).
		Updates(map[string]interface{}{
			"last_modified": event.LastModified,
			"start_time":    event.StartTime,
			"end_time":      event.EndTime,
			"summary":       event.Summary,
			"location":      event.Location,
			"description":   event.Description,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

// Delete removes an event by its ID
func (r *EventRepository) Delete(uid string) error {
	if uid == "" {
		return ErrInvalidID
	}

	result := database.DB.Where("uid = ?", uid).Delete(&models.Event{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

// InitTable initializes the calendar table if it doesn't exist
func (r *EventRepository) InitTable() error {
	return database.DB.AutoMigrate(&models.Event{})
}
