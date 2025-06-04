package main

import (
	"log"
	"path/filepath"
	"time"

	"github.com/do2024-2047/CalenDO/internal/database"
	"github.com/do2024-2047/CalenDO/internal/models"
	"github.com/do2024-2047/CalenDO/internal/repository"
	"github.com/spf13/viper"
)

func main() {
	// Initialize configuration
	initConfig()

	// Initialize database
	if err := database.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	// Initialize repositories for table migration only
	planningRepo := repository.NewPlanningRepository()
	eventRepo := repository.NewEventRepository()

	// Auto-migrate database tables
	if err := planningRepo.InitTable(); err != nil {
		log.Fatalf("Failed to initialize planning table: %v", err)
	}
	if err := eventRepo.InitTable(); err != nil {
		log.Fatalf("Failed to initialize event table: %v", err)
	}

	// Create default planning using direct database insert
	defaultPlanning := &models.Planning{
		ID:          "default-planning",
		Name:        "My Calendar",
		Description: "Default calendar planning",
		Color:       "#3B82F6",
		IsDefault:   true,
	}

	if err := database.DB.Create(defaultPlanning).Error; err != nil {
		log.Printf("Failed to create default planning (may already exist): %v", err)
	} else {
		log.Println("Created default planning")
	}

	// Create work planning using direct database insert
	workPlanning := &models.Planning{
		ID:          "work-planning",
		Name:        "Work Schedule",
		Description: "Work-related events and meetings",
		Color:       "#EF4444",
		IsDefault:   false,
	}

	if err := database.DB.Create(workPlanning).Error; err != nil {
		log.Printf("Failed to create work planning (may already exist): %v", err)
	} else {
		log.Println("Created work planning")
	}

	// Create personal planning using direct database insert
	personalPlanning := &models.Planning{
		ID:          "personal-planning",
		Name:        "Personal",
		Description: "Personal events and activities",
		Color:       "#10B981",
		IsDefault:   false,
	}

	if err := database.DB.Create(personalPlanning).Error; err != nil {
		log.Printf("Failed to create personal planning (may already exist): %v", err)
	} else {
		log.Println("Created personal planning")
	}

	// Create sample events using direct database inserts
	now := time.Now()

	// Default planning events
	defaultEvents := []*models.Event{
		{
			UID:          "sample-event-1",
			PlanningID:   "default-planning",
			Summary:      "Team Meeting",
			Description:  "Weekly team sync meeting",
			Location:     "Conference Room A",
			StartTime:    now.Add(24 * time.Hour),
			EndTime:      now.Add(24*time.Hour + time.Hour),
			Created:      now,
			LastModified: now,
		},
		{
			UID:          "sample-event-2",
			PlanningID:   "default-planning",
			Summary:      "Doctor Appointment",
			Description:  "Annual checkup",
			Location:     "Medical Center",
			StartTime:    now.Add(48 * time.Hour),
			EndTime:      now.Add(48*time.Hour + 30*time.Minute),
			Created:      now,
			LastModified: now,
		},
	}

	// Work planning events
	workEvents := []*models.Event{
		{
			UID:          "work-event-1",
			PlanningID:   "work-planning",
			Summary:      "Project Review",
			Description:  "Quarterly project review meeting",
			Location:     "Boardroom",
			StartTime:    now.Add(72 * time.Hour),
			EndTime:      now.Add(72*time.Hour + 2*time.Hour),
			Created:      now,
			LastModified: now,
		},
		{
			UID:          "work-event-2",
			PlanningID:   "work-planning",
			Summary:      "Client Presentation",
			Description:  "Presenting project results to client",
			Location:     "Client Office",
			StartTime:    now.Add(96 * time.Hour),
			EndTime:      now.Add(96*time.Hour + 90*time.Minute),
			Created:      now,
			LastModified: now,
		},
	}

	// Personal planning events
	personalEvents := []*models.Event{
		{
			UID:          "personal-event-1",
			PlanningID:   "personal-planning",
			Summary:      "Gym Session",
			Description:  "Weekly workout routine",
			Location:     "Local Gym",
			StartTime:    now.Add(12 * time.Hour),
			EndTime:      now.Add(12*time.Hour + 90*time.Minute),
			Created:      now,
			LastModified: now,
		},
		{
			UID:          "personal-event-2",
			PlanningID:   "personal-planning",
			Summary:      "Dinner with Friends",
			Description:  "Monthly dinner gathering",
			Location:     "Italian Restaurant",
			StartTime:    now.Add(120 * time.Hour),
			EndTime:      now.Add(120*time.Hour + 3*time.Hour),
			Created:      now,
			LastModified: now,
		},
	}

	// Seed all events using direct database inserts
	allEvents := append(append(defaultEvents, workEvents...), personalEvents...)
	for _, event := range allEvents {
		if err := database.DB.Create(event).Error; err != nil {
			log.Printf("Failed to create event %s (may already exist): %v", event.Summary, err)
		} else {
			log.Printf("Created event: %s", event.Summary)
		}
	}

	log.Println("Database seeding completed successfully!")
}

// initConfig reads in config file and ENV variables if set
func initConfig() {
	// Find the config directory
	configDir := filepath.Join(".", "configs")

	// Set the config name and location
	viper.SetConfigName("config") // Name of config file without extension
	viper.SetConfigType("yaml")   // Config file type
	viper.AddConfigPath(configDir)

	// Read the config
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Failed to read config: %v", err)
	}

	log.Printf("Using config file: %s", viper.ConfigFileUsed())
}
