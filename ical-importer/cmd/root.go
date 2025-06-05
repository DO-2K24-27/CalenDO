package cmd

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/do2024-2047/CalenDO/ical-importer/internal/database"
	"github.com/do2024-2047/CalenDO/ical-importer/internal/importer"
	"github.com/do2024-2047/CalenDO/ical-importer/internal/models"
	"github.com/emersion/go-ical"
	"github.com/google/uuid"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/teambition/rrule-go"
	"gopkg.in/yaml.v3"
)

var (
	configFile string
	dryRun     bool
	customName string
	customID   string
	syncDelete bool // New flag to control deletion behavior
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "ical-importer",
	Short: "Import iCal data into CalenDO database",
	Long: `A command-line tool to import calendar events from iCal URLs or files
into the CalenDO PostgreSQL database. Supports both one-time imports and
scheduled syncing of calendar data.`,
}

// importCmd represents the import command
var importCmd = &cobra.Command{
	Use:   "import [urls...]",
	Short: "Import events from iCal URLs or files",
	Long: `Import calendar events from one or more iCal URLs or local files.
Each iCal source will create a separate planning (calendar category) in the database.

By default, the importer will sync events bidirectionally:
- Add new events from the iCal feed
- Update existing events if they've changed
- Delete events that are no longer in the iCal feed

Custom name and ID options can only be used when importing a single source.

Examples:
  ical-importer import https://calendar.google.com/calendar/ical/example%40gmail.com/public/basic.ics
  ical-importer import file://path/to/calendar.ics
  ical-importer import --dry-run https://example.com/calendar.ics
  ical-importer import --name "My Custom Calendar" --id "custom-cal-id" https://example.com/calendar.ics
  ical-importer import --name "Work Calendar" file://work.ics
  ical-importer import --sync-delete=false https://example.com/calendar.ics`,
	Args: cobra.MinimumNArgs(1),
	Run:  runImport,
}

// initCmd represents the init command
var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize database tables",
	Long:  `Create the necessary database tables for CalenDO if they don't exist.`,
	Run:   runInit,
}

// statsCmd represents the stats command
var statsCmd = &cobra.Command{
	Use:   "stats",
	Short: "Show database statistics",
	Long:  `Display statistics about the number of plannings and events in the database.`,
	Run:   runStats,
}

// syncCmd represents the sync command
var syncCmd = &cobra.Command{
	Use:   "sync [config-file]",
	Short: "Sync calendars from a configuration file",
	Long: `Sync multiple calendar sources from a YAML configuration file.
This is useful for automated/scheduled imports of multiple calendars.

By default, the sync command will maintain perfect synchronization:
- Add new events from iCal feeds
- Update existing events if they've changed  
- Delete events that are no longer in iCal feeds

Example config file:
calendars:
  - name: "Work Calendar"
    url: "https://calendar.google.com/calendar/ical/work@example.com/public/basic.ics"
    enabled: true
  - name: "Personal Calendar"
    url: "https://calendar.google.com/calendar/ical/personal@example.com/public/basic.ics"
    enabled: true
    custom_id: "personal-cal"
  - name: "Team Calendar" 
    url: "https://outlook.office365.com/owa/calendar/team@company.com/reachcalendar.ics"
    enabled: false

Configuration options:
  - name: Display name for the calendar (required, will override calendar's internal name)
  - url: iCal URL or file path (required)
  - enabled: Whether to sync this calendar (default: true)
  - custom_id: Custom ID for the planning (optional)`,
	Args: cobra.ExactArgs(1),
	Run:  runSync,
}

// SyncConfig represents the sync configuration file structure
type SyncConfig struct {
	Calendars []CalendarSource `yaml:"calendars"`
}

type CalendarSource struct {
	Name     string `yaml:"name"`
	URL      string `yaml:"url"`
	Enabled  bool   `yaml:"enabled"`
	CustomID string `yaml:"custom_id,omitempty"` // Optional custom planning ID
}

func init() {
	cobra.OnInitialize(initConfig)

	// Global flags
	rootCmd.PersistentFlags().StringVar(&configFile, "config", "", "config file (default is ./config.yaml)")
	rootCmd.PersistentFlags().BoolVar(&dryRun, "dry-run", false, "show what would be imported without making changes")

	// Import command specific flags
	importCmd.Flags().StringVar(&customName, "name", "", "custom name for the planning/calendar")
	importCmd.Flags().StringVar(&customID, "id", "", "custom ID for the planning/calendar")
	importCmd.Flags().BoolVar(&syncDelete, "sync-delete", true, "delete events that are no longer in the iCal feed")

	// Sync command specific flags
	syncCmd.Flags().BoolVar(&syncDelete, "sync-delete", true, "delete events that are no longer in the iCal feed")

	// Add subcommands
	rootCmd.AddCommand(importCmd)
	rootCmd.AddCommand(initCmd)
	rootCmd.AddCommand(statsCmd)
	rootCmd.AddCommand(syncCmd)
}

// Execute adds all child commands to the root command and sets flags appropriately
func Execute() error {
	return rootCmd.Execute()
}

// initConfig reads in config file and ENV variables if set
func initConfig() {
	if configFile != "" {
		viper.SetConfigFile(configFile)
	} else {
		// Look for config in current directory
		viper.AddConfigPath(".")
		viper.AddConfigPath("../backend/configs") // Relative path to backend config
		viper.SetConfigType("yaml")
		viper.SetConfigName("config")
	}

	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in
	if err := viper.ReadInConfig(); err == nil {
		log.Printf("Using config file: %s", viper.ConfigFileUsed())
	} else {
		log.Printf("Warning: Could not read config file: %v", err)
		// Set default database configuration
		setDefaultConfig()
	}
}

func setDefaultConfig() {
	viper.SetDefault("database.driver", "postgres")
	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", 5432)
	viper.SetDefault("database.username", "postgres")
	viper.SetDefault("database.password", "postgres")
	viper.SetDefault("database.dbname", "calendo")
	viper.SetDefault("database.sslmode", "disable")
	viper.SetDefault("database.max_open_conns", 25)
	viper.SetDefault("database.max_idle_conns", 5)
	viper.SetDefault("database.conn_max_lifetime", "5m")
}

func runImport(cmd *cobra.Command, args []string) {
	// Initialize database
	if err := database.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	importerService := importer.NewImporter(database.DB)

	// Validate that if multiple sources are provided, no custom name/ID is used
	if len(args) > 1 && (customName != "" || customID != "") {
		log.Fatalf("Custom name and ID can only be used with a single source")
	}

	for _, source := range args {
		log.Printf("Processing source: %s", source)

		// Parse and import the iCal source
		if err := processICalSourceWithCustomization(importerService, source, customName, customID); err != nil {
			log.Printf("Failed to process source %s: %v", source, err)
			continue
		}

		log.Printf("Successfully processed source: %s", source)
	}

	log.Println("Import completed!")
}

func processICalSourceWithCustomization(importerService *importer.Importer, source, customName, customID string) error {
	// Parse the source to determine if it's a URL or file path
	var cal *ical.Calendar
	var err error
	var planningName string

	if strings.HasPrefix(source, "http://") || strings.HasPrefix(source, "https://") {
		cal, err = fetchICalFromURL(source)
		if err != nil {
			return fmt.Errorf("failed to fetch iCal from URL: %w", err)
		}
		planningName = extractNameFromURL(source)
	} else if strings.HasPrefix(source, "file://") {
		filePath := strings.TrimPrefix(source, "file://")
		cal, err = parseICalFromFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to parse iCal file: %w", err)
		}
		planningName = extractNameFromFile(filePath)
	} else {
		// Assume it's a local file path
		cal, err = parseICalFromFile(source)
		if err != nil {
			return fmt.Errorf("failed to parse iCal file: %w", err)
		}
		planningName = extractNameFromFile(source)
	}

	// Determine the final planning name
	var finalPlanningName string
	if customName != "" {
		// Use custom name if provided
		finalPlanningName = customName
	} else {
		// Try to get name from calendar's X-WR-CALNAME property, fallback to extracted name
		finalPlanningName = planningName
		if prop := cal.Props.Get("X-WR-CALNAME"); prop != nil && prop.Value != "" {
			finalPlanningName = prop.Value
		}
	}

	// Determine the final planning ID
	var finalPlanningID string
	if customID != "" {
		finalPlanningID = customID
	} else {
		finalPlanningID = generatePlanningID(source)
	}

	// Create or get planning
	planning := &models.Planning{
		ID:          finalPlanningID,
		Name:        finalPlanningName,
		Description: generateCalendarDescription(cal, source),
		Color:       generateRandomColor(),
		IsDefault:   false,
	}

	if dryRun {
		log.Printf("[DRY RUN] Would create planning: %s (%s)", planning.Name, planning.ID)
	} else {
		if err := importerService.CreateOrUpdatePlanning(planning); err != nil {
			return fmt.Errorf("failed to create planning: %w", err)
		}
		log.Printf("Created/Updated planning: %s (%s)", planning.Name, planning.ID)
	}

	// Process events
	var allNewEvents []*models.Event
	eventCount := 0
	for _, child := range cal.Children {
		if child.Name == "VEVENT" {
			baseEvent, err := parseEvent(child, planning.ID)
			if err != nil {
				log.Printf("Warning: Failed to parse event: %v", err)
				continue
			}

			// Expand recurring events
			events, err := expandRecurringEvent(baseEvent, child, 100) // Max 100 occurrences
			if err != nil {
				log.Printf("Warning: Failed to expand recurring event %s: %v", baseEvent.Summary, err)
				continue
			}

			// Collect all events for sync
			allNewEvents = append(allNewEvents, events...)
			eventCount += len(events)
		}
	}

	if dryRun {
		log.Printf("[DRY RUN] Would sync %d events for planning: %s", eventCount, planning.Name)

		// In dry run mode, show what would be deleted (only if sync-delete is enabled)
		if syncDelete {
			existingEvents, err := importerService.GetEventsByPlanningID(planning.ID)
			if err == nil {
				newEventUIDs := make(map[string]bool)
				for _, event := range allNewEvents {
					newEventUIDs[event.UID] = true
				}

				deletionCount := 0
				for _, existingEvent := range existingEvents {
					if !newEventUIDs[existingEvent.UID] {
						log.Printf("[DRY RUN] Would delete event no longer in iCal: %s (%s)", existingEvent.Summary, existingEvent.UID)
						deletionCount++
					}
				}
				if deletionCount > 0 {
					log.Printf("[DRY RUN] Would delete %d events no longer in iCal", deletionCount)
				}
			}
		} else {
			log.Printf("[DRY RUN] Sync-delete disabled - would only add/update events")
		}
	} else {
		// Sync events based on sync-delete flag
		if syncDelete {
			// Sync events (add/update new ones, delete removed ones)
			if err := importerService.SyncEventsForPlanning(planning.ID, allNewEvents); err != nil {
				return fmt.Errorf("failed to sync events: %w", err)
			}
			log.Printf("Synced %d events for planning: %s", eventCount, planning.Name)
		} else {
			// Legacy mode: only add/update events, don't delete
			for _, event := range allNewEvents {
				if err := importerService.CreateOrUpdateEvent(event); err != nil {
					log.Printf("Warning: Failed to import event %s: %v", event.Summary, err)
				}
			}
			log.Printf("Imported %d events for planning: %s", eventCount, planning.Name)
		}
	}

	// Generate and log calendar description
	desc := generateCalendarDescription(cal, source)
	log.Printf("Calendar description:\n%s", desc)

	return nil
}

func fetchICalFromURL(url string) (*ical.Calendar, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, resp.Status)
	}

	return ical.NewDecoder(resp.Body).Decode()
}

func parseICalFromFile(filePath string) (*ical.Calendar, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file %s: %w", filePath, err)
	}
	defer file.Close()

	decoder := ical.NewDecoder(file)
	cal, err := decoder.Decode()
	if err != nil {
		return nil, fmt.Errorf("failed to decode iCal from %s: %w", filePath, err)
	}

	return cal, nil
}

func parseEvent(component *ical.Component, planningID string) (*models.Event, error) {
	event := &models.Event{
		PlanningID: planningID,
	}

	// Required fields
	if uid := component.Props.Get("UID"); uid != nil {
		event.UID = uid.Value
	} else {
		event.UID = uuid.New().String()
	}

	if summary := component.Props.Get("SUMMARY"); summary != nil {
		event.Summary = summary.Value
	}

	if description := component.Props.Get("DESCRIPTION"); description != nil {
		event.Description = description.Value
	}

	if location := component.Props.Get("LOCATION"); location != nil {
		event.Location = location.Value
	}

	// Parse dates
	if dtstart := component.Props.Get("DTSTART"); dtstart != nil {
		startTime, err := parseDateTimeProperty(dtstart)
		if err != nil {
			return nil, fmt.Errorf("failed to parse start time: %w", err)
		}
		event.StartTime = startTime
	}

	if dtend := component.Props.Get("DTEND"); dtend != nil {
		endTime, err := parseDateTimeProperty(dtend)
		if err != nil {
			return nil, fmt.Errorf("failed to parse end time: %w", err)
		}
		event.EndTime = endTime
	} else {
		// If no end time, assume 1 hour duration
		event.EndTime = event.StartTime.Add(time.Hour)
	}

	// Parse timestamps
	now := time.Now()
	event.Created = now
	event.LastModified = now

	if created := component.Props.Get("CREATED"); created != nil {
		if createdTime, err := parseDateTimeProperty(created); err == nil {
			event.Created = createdTime
		}
	}

	if lastModified := component.Props.Get("LAST-MODIFIED"); lastModified != nil {
		if modifiedTime, err := parseDateTimeProperty(lastModified); err == nil {
			event.LastModified = modifiedTime
		}
	}

	return event, nil
}

func parseDateTimeProperty(prop *ical.Prop) (time.Time, error) {
	value := prop.Value

	// Try different time formats
	formats := []string{
		"20060102T150405Z", // UTC format
		"20060102T150405",  // Local format
		"20060102",         // Date only
	}

	for _, format := range formats {
		if t, err := time.Parse(format, value); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse date: %s", value)
}

func extractNameFromURL(urlStr string) string {
	u, err := url.Parse(urlStr)
	if err != nil {
		return "Imported Calendar"
	}

	host := u.Host
	if strings.Contains(host, "google.com") {
		return "Google Calendar"
	} else if strings.Contains(host, "outlook.com") || strings.Contains(host, "live.com") {
		return "Outlook Calendar"
	} else if strings.Contains(host, "icloud.com") {
		return "iCloud Calendar"
	}

	return fmt.Sprintf("Calendar from %s", host)
}

func extractNameFromFile(filePath string) string {
	filename := filepath.Base(filePath)
	name := strings.TrimSuffix(filename, filepath.Ext(filename))
	return fmt.Sprintf("Calendar: %s", name)
}

func generatePlanningID(source string) string {
	// Create a SHA256 hash of the iCal source (URL or file path)
	hash := sha256.Sum256([]byte(source))
	hashStr := hex.EncodeToString(hash[:])

	// Use first 12 characters of the hash for a more manageable ID
	return fmt.Sprintf("ical-%s", hashStr[:12])
}

func generateRandomColor() string {
	colors := []string{
		"#3B82F6", // Blue
		"#EF4444", // Red
		"#10B981", // Green
		"#F59E0B", // Yellow
		"#8B5CF6", // Purple
		"#F97316", // Orange
		"#06B6D4", // Cyan
		"#84CC16", // Lime
		"#EC4899", // Pink
		"#6B7280", // Gray
	}

	return colors[int(time.Now().UnixNano())%len(colors)]
}

func runInit(cmd *cobra.Command, args []string) {
	// Initialize database
	if err := database.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	importerService := importer.NewImporter(database.DB)

	if err := importerService.InitializeTables(); err != nil {
		log.Fatalf("Failed to initialize tables: %v", err)
	}

	log.Println("Database tables initialized successfully!")
}

func runStats(cmd *cobra.Command, args []string) {
	// Initialize database
	if err := database.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	// Get statistics
	importerService := importer.NewImporter(database.DB)

	stats, err := importerService.GetStats()
	if err != nil {
		log.Fatalf("Failed to get statistics: %v", err)
	}

	log.Printf("Database statistics:")
	log.Printf("  Plannings: %d", stats["plannings"])
	log.Printf("  Events: %d", stats["events"])
}

// runSync synchronizes calendars from the given configuration file
func runSync(cmd *cobra.Command, args []string) {
	configFile := args[0]

	// Read sync configuration
	file, err := os.Open(configFile)
	if err != nil {
		log.Fatalf("Failed to open sync config file: %v", err)
	}
	defer file.Close()

	var config SyncConfig
	decoder := yaml.NewDecoder(file)
	if err := decoder.Decode(&config); err != nil {
		log.Fatalf("Failed to parse sync config: %v", err)
	}

	if len(config.Calendars) == 0 {
		log.Println("No calendars configured for sync")
		return
	}

	// Initialize database
	if err := database.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	importerService := importer.NewImporter(database.DB)

	log.Printf("Starting sync of %d calendar sources...", len(config.Calendars))

	successCount := 0
	errorCount := 0

	for _, cal := range config.Calendars {
		if !cal.Enabled {
			log.Printf("Skipping disabled calendar: %s", cal.Name)
			continue
		}

		log.Printf("Syncing calendar: %s (%s)", cal.Name, cal.URL)

		if err := processICalSourceWithCustomization(importerService, cal.URL, cal.Name, cal.CustomID); err != nil {
			log.Printf("Failed to sync calendar %s: %v", cal.Name, err)
			errorCount++
			continue
		}

		log.Printf("Successfully synced calendar: %s", cal.Name)
		successCount++
	}

	log.Printf("Sync completed! Success: %d, Errors: %d", successCount, errorCount)
}

// generateCalendarDescription creates a descriptive text about the calendar based on its properties
func generateCalendarDescription(cal *ical.Calendar, source string) string {
	var descParts []string

	// Add calendar name if available
	if prop := cal.Props.Get("X-WR-CALNAME"); prop != nil && prop.Value != "" {
		descParts = append(descParts, fmt.Sprintf("Calendar: %s", prop.Value))
	}

	// Add calendar description if available
	if prop := cal.Props.Get("X-WR-CALDESC"); prop != nil && prop.Value != "" {
		descParts = append(descParts, fmt.Sprintf("Description: %s", prop.Value))
	}

	// Add timezone information if available
	if prop := cal.Props.Get("X-WR-TIMEZONE"); prop != nil && prop.Value != "" {
		descParts = append(descParts, fmt.Sprintf("Timezone: %s", prop.Value))
	}

	// Add product ID (what created the calendar) if available
	if prop := cal.Props.Get("PRODID"); prop != nil && prop.Value != "" {
		// Clean up common PRODID values to be more user-friendly
		prodID := prop.Value
		if strings.Contains(prodID, "Google") {
			prodID = "Google Calendar"
		} else if strings.Contains(prodID, "Microsoft") || strings.Contains(prodID, "Outlook") {
			prodID = "Microsoft Outlook"
		} else if strings.Contains(prodID, "Apple") {
			prodID = "Apple Calendar"
		}
		descParts = append(descParts, fmt.Sprintf("Created by: %s", prodID))
	}

	// Add version if available
	if prop := cal.Props.Get("VERSION"); prop != nil && prop.Value != "" {
		descParts = append(descParts, fmt.Sprintf("iCal Version: %s", prop.Value))
	}

	// Count events
	eventCount := 0
	for _, child := range cal.Children {
		if child.Name == "VEVENT" {
			eventCount++
		}
	}
	if eventCount > 0 {
		descParts = append(descParts, fmt.Sprintf("Contains %d events", eventCount))
	}

	// Add source information
	if strings.HasPrefix(source, "http://") || strings.HasPrefix(source, "https://") {
		if u, err := url.Parse(source); err == nil {
			descParts = append(descParts, fmt.Sprintf("Source: %s", u.Host))
		}
	} else {
		descParts = append(descParts, fmt.Sprintf("Source: Local file (%s)", filepath.Base(source)))
	}

	// Join all parts with newlines for a nice formatted description
	if len(descParts) > 0 {
		return strings.Join(descParts, "\n")
	}

	// Fallback to original behavior if no properties found
	return fmt.Sprintf("Imported from: %s", source)
}

// expandRecurringEvent expands a recurring event into individual events based on RRULE
func expandRecurringEvent(baseEvent *models.Event, component *ical.Component, maxOccurrences int) ([]*models.Event, error) {
	// Check if event has RRULE property
	rruleProp := component.Props.Get("RRULE")
	if rruleProp == nil {
		// Not a recurring event, return original event
		return []*models.Event{baseEvent}, nil
	}

	// Parse RRULE
	rule, err := rrule.StrToRRule(rruleProp.Value)
	if err != nil {
		log.Printf("Warning: Failed to parse RRULE '%s': %v", rruleProp.Value, err)
		return []*models.Event{baseEvent}, nil
	}

	// Calculate duration
	duration := baseEvent.EndTime.Sub(baseEvent.StartTime)

	// Generate occurrences
	occurrences := rule.Between(baseEvent.StartTime, baseEvent.StartTime.AddDate(2, 0, 0), true) // Expand for 2 years
	if len(occurrences) > maxOccurrences {
		occurrences = occurrences[:maxOccurrences]
	}

	var events []*models.Event
	for i, occurrence := range occurrences {
		eventCopy := *baseEvent
		eventCopy.StartTime = occurrence
		eventCopy.EndTime = occurrence.Add(duration)

		// Generate unique UID for each occurrence
		if i > 0 {
			eventCopy.UID = fmt.Sprintf("%s-recurrence-%d", baseEvent.UID, i)
		}

		events = append(events, &eventCopy)
	}

	return events, nil
}
