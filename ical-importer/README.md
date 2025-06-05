# iCal Importer for CalenDO

A command-line tool to import calendar events from iCal URLs or files into the CalenDO PostgreSQL database.

## Features

- Import events from iCal URLs (Google Calendar, Outlook, iCloud, etc.)
- Import events from local iCal files
- Automatic planning (calendar category) creation
- Event deduplication based on UID
- Dry-run mode to preview imports
- Support for recurring events
- Configurable database connection

## Installation

1. Clone or create the project:
```bash
cd /home/dupelouxh/Documents/Projects/CalenDO/ical-importer
```

2. Initialize Go modules and install dependencies:
```bash
go mod tidy
```

3. Build the application:
```bash
go build -o ical-importer .
```

## Configuration

The tool can use the same configuration file as the CalenDO backend. Create a `config.yaml` file or use the existing one from `../backend/configs/config.yaml`.

Example configuration:
```yaml
database:
  driver: postgres
  host: localhost
  port: 5432
  username: postgres
  password: postgres
  dbname: calendo
  sslmode: disable
  max_open_conns: 25
  max_idle_conns: 5
  conn_max_lifetime: 5m
```

You can also set configuration via environment variables:
```bash
export DATABASE_HOST=localhost
export DATABASE_PORT=5432
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=postgres
export DATABASE_DBNAME=calendo
```

## Usage

### Import from URLs

Import from Google Calendar:
```bash
./ical-importer import "https://calendar.google.com/calendar/ical/your-email%40gmail.com/public/basic.ics"
```

Import from multiple sources:
```bash
./ical-importer import \
  "https://calendar.google.com/calendar/ical/work%40example.com/public/basic.ics" \
  "https://calendar.google.com/calendar/ical/personal%40example.com/public/basic.ics"
```

### Import from Files

Import from local file:
```bash
./ical-importer import /path/to/calendar.ics
```

Import using file:// protocol:
```bash
./ical-importer import file:///path/to/calendar.ics
```

### Dry Run

Preview what would be imported without making changes:
```bash
./ical-importer import --dry-run "https://example.com/calendar.ics"
```

### Custom Configuration

Use a specific configuration file:
```bash
./ical-importer import --config /path/to/config.yaml "https://example.com/calendar.ics"
```

## How It Works

1. **Planning Creation**: Each iCal source creates a separate "planning" (calendar category) in the database
2. **Event Import**: All events from the iCal are imported and linked to the planning
3. **Deduplication**: Events with the same UID are updated rather than duplicated
4. **Metadata Preservation**: Maintains event timestamps, descriptions, locations, and other metadata

## Common iCal Sources

### Google Calendar
1. Go to your Google Calendar
2. Click on the calendar name → Settings and sharing
3. Scroll to "Integrate calendar" 
4. Copy the "Public address in iCal format"

### Outlook/Hotmail
1. Go to Outlook.com calendar
2. Click Share → Get a link
3. Choose "Can view all details" and copy the ICS link

### iCloud Calendar
1. Go to iCloud.com → Calendar
2. Click the share icon next to calendar name
3. Check "Public Calendar" and copy the link

## Database Schema

The tool populates two main tables:

### Plannings Table
- `id`: Unique identifier for the calendar
- `name`: Display name of the calendar
- `description`: Description including source URL
- `color`: Hex color code for the calendar
- `created`: Creation timestamp
- `updated`: Last update timestamp
- `is_default`: Whether this is the default calendar

### Events Table
- `uid`: Unique event identifier from iCal
- `planning_id`: Foreign key to plannings table
- `summary`: Event title
- `description`: Event description
- `location`: Event location
- `start_time`: Event start time
- `end_time`: Event end time
- `created`: Creation timestamp
- `last_modified`: Last modification timestamp

## Development

### Running Tests
```bash
go test ./...
```

### Building for Different Platforms
```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o ical-importer-linux .

# macOS
GOOS=darwin GOARCH=amd64 go build -o ical-importer-macos .

# Windows
GOOS=windows GOARCH=amd64 go build -o ical-importer-windows.exe .
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in config
- Verify database exists
- Check network connectivity

### iCal Parsing Issues
- Ensure the iCal URL is publicly accessible
- Check if the calendar requires authentication
- Verify the iCal format is valid

### Common Error Messages

**"Failed to connect to database"**
- Check database configuration
- Ensure PostgreSQL is running
- Verify credentials

**"Failed to fetch iCal from URL"**
- Check URL accessibility
- Verify internet connection
- Some calendars may require authentication

**"Failed to parse date"**
- The iCal file may have non-standard date formats
- Check the iCal file validity

## License

This tool is part of the CalenDO project and follows the same license terms.
