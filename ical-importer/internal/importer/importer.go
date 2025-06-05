package importer

import (
	"log"

	"github.com/do2024-2047/CalenDO/ical-importer/internal/models"
	"gorm.io/gorm"
)

// Importer handles the import of iCal data into the database
type Importer struct {
	db *gorm.DB
}

// NewImporter creates a new Importer instance
func NewImporter(db *gorm.DB) *Importer {
	return &Importer{
		db: db,
	}
}

// CreateOrUpdatePlanning creates a new planning or updates an existing one
func (i *Importer) CreateOrUpdatePlanning(planning *models.Planning) error {
	// Check if planning already exists
	var existing models.Planning
	result := i.db.Where("id = ?", planning.ID).First(&existing)

	if result.Error == nil {
		// Planning exists, update it but preserve certain fields
		planning.Created = existing.Created // Preserve original creation time
		planning.Color = existing.Color     // Preserve existing color
		return i.db.Save(planning).Error
	} else if result.Error == gorm.ErrRecordNotFound {
		// Planning doesn't exist, create it
		return i.db.Create(planning).Error
	}

	return result.Error
}

// CreateOrUpdateEvent creates a new event or updates an existing one
func (i *Importer) CreateOrUpdateEvent(event *models.Event) error {
	// Check if event already exists
	var existing models.Event
	result := i.db.Where("uid = ?", event.UID).First(&existing)

	if result.Error == nil {
		// Event exists, update it
		event.Created = existing.Created // Preserve original creation time
		return i.db.Save(event).Error
	} else if result.Error == gorm.ErrRecordNotFound {
		// Event doesn't exist, create it
		return i.db.Create(event).Error
	}

	return result.Error
}

// DeleteEventsForPlanning deletes all events for a specific planning
func (i *Importer) DeleteEventsForPlanning(planningID string) error {
	return i.db.Where("planning_id = ?", planningID).Delete(&models.Event{}).Error
}

// GetPlanningByID retrieves a planning by its ID
func (i *Importer) GetPlanningByID(id string) (*models.Planning, error) {
	var planning models.Planning
	err := i.db.Where("id = ?", id).First(&planning).Error
	if err != nil {
		return nil, err
	}
	return &planning, nil
}

// GetEventByUID retrieves an event by its UID
func (i *Importer) GetEventByUID(uid string) (*models.Event, error) {
	var event models.Event
	err := i.db.Where("uid = ?", uid).First(&event).Error
	if err != nil {
		return nil, err
	}
	return &event, nil
}

// GetEventsByPlanningID retrieves all events for a specific planning
func (i *Importer) GetEventsByPlanningID(planningID string) ([]*models.Event, error) {
	var events []*models.Event
	err := i.db.Where("planning_id = ?", planningID).Find(&events).Error
	if err != nil {
		return nil, err
	}
	return events, nil
}

// DeleteEventByUID deletes an event by its UID
func (i *Importer) DeleteEventByUID(uid string) error {
	return i.db.Where("uid = ?", uid).Delete(&models.Event{}).Error
}

// SyncEventsForPlanning syncs events for a planning, removing events that are no longer in the iCal feed
func (i *Importer) SyncEventsForPlanning(planningID string, newEvents []*models.Event) error {
	// Get all existing events for this planning
	existingEvents, err := i.GetEventsByPlanningID(planningID)
	if err != nil {
		return err
	}

	// Create a map of new event UIDs for quick lookup
	newEventUIDs := make(map[string]bool)
	for _, event := range newEvents {
		newEventUIDs[event.UID] = true
	}

	// Find events that are in the database but not in the new iCal feed
	var eventsToDelete []string
	for _, existingEvent := range existingEvents {
		if !newEventUIDs[existingEvent.UID] {
			eventsToDelete = append(eventsToDelete, existingEvent.UID)
		}
	}

	// Delete events that are no longer in the iCal feed
	deleteCount := 0
	for _, uid := range eventsToDelete {
		if err := i.DeleteEventByUID(uid); err != nil {
			log.Printf("Warning: Failed to delete event %s: %v", uid, err)
		} else {
			deleteCount++
		}
	}

	if deleteCount > 0 {
		log.Printf("Deleted %d events no longer in iCal feed", deleteCount)
	}

	// Create or update events from the new iCal feed
	updateCount := 0
	createCount := 0
	for _, event := range newEvents {
		var existing models.Event
		result := i.db.Where("uid = ?", event.UID).First(&existing)

		if result.Error == nil {
			// Event exists, update it
			event.Created = existing.Created // Preserve original creation time
			if err := i.db.Save(event).Error; err != nil {
				log.Printf("Warning: Failed to update event %s: %v", event.UID, err)
			} else {
				updateCount++
			}
		} else if result.Error == gorm.ErrRecordNotFound {
			// Event doesn't exist, create it
			if err := i.db.Create(event).Error; err != nil {
				log.Printf("Warning: Failed to create event %s: %v", event.UID, err)
			} else {
				createCount++
			}
		} else {
			log.Printf("Warning: Database error for event %s: %v", event.UID, result.Error)
		}
	}

	if createCount > 0 || updateCount > 0 {
		log.Printf("Processed events: %d created, %d updated", createCount, updateCount)
	}

	return nil
}

// InitializeTables creates the necessary database tables if they don't exist
func (i *Importer) InitializeTables() error {
	// Auto-migrate the tables
	if err := i.db.AutoMigrate(&models.Planning{}); err != nil {
		log.Printf("Failed to migrate Planning table: %v", err)
		return err
	}

	if err := i.db.AutoMigrate(&models.Event{}); err != nil {
		log.Printf("Failed to migrate Event table: %v", err)
		return err
	}

	log.Println("Database tables initialized successfully")
	return nil
}

// GetStats returns import statistics
func (i *Importer) GetStats() (map[string]int64, error) {
	stats := make(map[string]int64)

	var planningCount int64
	if err := i.db.Model(&models.Planning{}).Count(&planningCount).Error; err != nil {
		return nil, err
	}
	stats["plannings"] = planningCount

	var eventCount int64
	if err := i.db.Model(&models.Event{}).Count(&eventCount).Error; err != nil {
		return nil, err
	}
	stats["events"] = eventCount

	return stats, nil
}
