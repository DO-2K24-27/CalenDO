package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/do2024-2047/CalenDO/internal/database"
	"github.com/do2024-2047/CalenDO/internal/handlers"
	"github.com/do2024-2047/CalenDO/internal/middleware"
	"github.com/do2024-2047/CalenDO/internal/repository"
	"github.com/gorilla/mux"
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

	// Initialize event repository and auto-migrate the Event model
	eventRepo := repository.NewEventRepository()
	if err := eventRepo.InitTable(); err != nil {
		log.Fatalf("Failed to initialize event table: %v", err)
	}

	// Create a new router
	r := mux.NewRouter()

	// Register routes with event repository
	handlers.InitializeHandlers(eventRepo)
	handlers.RegisterRoutes(r)

	// Add middleware
	r.Use(middleware.Logger)
	r.Use(middleware.CORS)

	// Set up the server
	port := viper.GetString("port")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port

	srv := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start the server in a goroutine
	go func() {
		log.Printf("Starting server on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error starting server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	log.Println("Server shutting down...")
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
