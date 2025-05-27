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

	// Create repository and initialize table
	eventRepo := repository.NewEventRepository()
	if err := eventRepo.InitTable(); err != nil {
		log.Fatalf("Failed to initialize event table: %v", err)
	}

	// Create sample events
	events := []models.Event{
		{
			Summary:     "Team Meeting",
			Description: "Weekly team sync",
			Location:    "Conference Room A",
			StartTime:   time.Now().Add(24 * time.Hour),
			EndTime:     time.Now().Add(25 * time.Hour),
		},
		{
			Summary:     "Client Presentation",
			Description: "Present the new features to the client",
			Location:    "Main Board Room",
			StartTime:   time.Now().Add(48 * time.Hour),
			EndTime:     time.Now().Add(50 * time.Hour),
		},
		{
			Summary:     "Product Launch",
			Description: "Launch the new product version",
			Location:    "Online - Zoom",
			StartTime:   time.Now().Add(72 * time.Hour),
			EndTime:     time.Now().Add(74 * time.Hour),
		},
	}

	// Insert events into the database
	for i := range events {
		if err := eventRepo.Create(&events[i]); err != nil {
			log.Printf("Failed to create event %s: %v", events[i].Summary, err)
		} else {
			log.Printf("Created event: %s with UID: %s", events[i].Summary, events[i].UID)
		}
	}

	log.Println("Seeding completed successfully")
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
