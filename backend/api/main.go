package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	// Import the docs package for Swagger
	_ "github.com/do2024-2047/CalenDO/docs"
	"github.com/do2024-2047/CalenDO/internal/database"
	"github.com/do2024-2047/CalenDO/internal/handlers"
	"github.com/do2024-2047/CalenDO/internal/middleware"
	"github.com/do2024-2047/CalenDO/internal/repository"
	"github.com/gorilla/mux"
	"github.com/spf13/viper"
	httpSwagger "github.com/swaggo/http-swagger"
)

// @title CalenDO API
// @version 1.0
// @description This is the CalenDO API Server for calendar event management.
func main() {
	// Initialize configuration
	initConfig()

	// Initialize database
	if err := database.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	// Initialize repositories
	eventRepo := repository.NewEventRepository()
	planningRepo := repository.NewPlanningRepository()

	// Auto-migrate database tables
	if err := planningRepo.InitTable(); err != nil {
		log.Fatalf("Failed to initialize planning table: %v", err)
	}
	if err := eventRepo.InitTable(); err != nil {
		log.Fatalf("Failed to initialize event table: %v", err)
	}

	// Create a new router
	r := mux.NewRouter()

	// Register routes with repositories
	handlers.InitializeHandlers(eventRepo)
	handlers.InitializePlanningHandlers(planningRepo)
	handlers.RegisterRoutes(r)

	// Serve the Swagger JSON file directly
	r.HandleFunc("/swagger/swagger.json", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./docs/swagger.json")
	})

	// Swagger endpoints
	r.PathPrefix("/swagger/").Handler(httpSwagger.Handler(
		httpSwagger.URL("/swagger/swagger.json"),
		httpSwagger.DeepLinking(true),
		httpSwagger.DocExpansion("none"),
		httpSwagger.DomID("swagger-ui"),
	)).Methods(http.MethodGet)

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

	// Enable reading environment variables
	viper.AutomaticEnv() // read in environment variables that match

	// Allow environment variables to override config file values
	viper.BindEnv("database.password", "DB_PASSWORD")
	viper.BindEnv("database.host", "DB_HOST")
	viper.BindEnv("database.username", "DB_USER")
	viper.BindEnv("database.dbname", "DB_NAME")
	viper.BindEnv("database.port", "DB_PORT")

	// Read the config
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Failed to read config: %v", err)
	}

	log.Printf("Using config file: %s", viper.ConfigFileUsed())
}
