package repository

import (
	"errors"

	"github.com/do2024-2047/CalenDO/internal/database"
	"github.com/do2024-2047/CalenDO/internal/models"
	"gorm.io/gorm"
)

// PlanningRepository handles database operations for plannings
type PlanningRepository struct{}

// NewPlanningRepository creates a new planning repository
func NewPlanningRepository() *PlanningRepository {
	return &PlanningRepository{}
}

// FindAll returns all plannings
func (r *PlanningRepository) FindAll() ([]*models.Planning, error) {
	var plannings []*models.Planning

	result := database.DB.Order("created DESC").Find(&plannings)
	if result.Error != nil {
		return nil, result.Error
	}

	return plannings, nil
}

// FindByID returns a planning by its ID
func (r *PlanningRepository) FindByID(id string) (*models.Planning, error) {
	if id == "" {
		return nil, ErrInvalidID
	}

	var planning models.Planning
	result := database.DB.Where("id = ?", id).First(&planning)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, result.Error
	}

	return &planning, nil
}

// FindByIDWithEventCount returns a planning by its ID with event count
func (r *PlanningRepository) FindByIDWithEventCount(id string) (*models.Planning, int64, error) {
	planning, err := r.FindByID(id)
	if err != nil {
		return nil, 0, err
	}

	var eventCount int64
	countResult := database.DB.Model(&models.Event{}).Where("planning_id = ?", id).Count(&eventCount)
	if countResult.Error != nil {
		return planning, 0, countResult.Error
	}

	return planning, eventCount, nil
}

// GetDefault returns the default planning
func (r *PlanningRepository) GetDefault() (*models.Planning, error) {
	var planning models.Planning
	result := database.DB.Where("is_default = ?", true).First(&planning)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, result.Error
	}

	return &planning, nil
}

// InitTable initializes the plannings table if it doesn't exist
func (r *PlanningRepository) InitTable() error {
	return database.DB.AutoMigrate(&models.Planning{})
}
