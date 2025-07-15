# CalenDO Image Generator

A Python FastAPI service that generates calendar day view images based on the CalenDO frontend theme and styling.

## Features

- **Day View Generation**: Creates beautiful day view images showing events in a time-based layout
- **CalenDO Theme Integration**: Uses the exact color scheme and styling from the frontend
- **Event Visualization**: Shows events with their planning colors, times, locations, and descriptions
- **Responsive Layout**: Automatically adjusts time range based on events
- **REST API**: Simple HTTP endpoints for image generation

## API Endpoints

### `GET /day-view`

Generate a day view image for a specific date.

**Query Parameters:**

- `date` (optional): Date in YYYY-MM-DD format (default: today)
- `width` (optional): Image width in pixels (default: 800)
- `height` (optional): Image height in pixels (default: 1000)

**Response:** PNG image

**Example:**

```bash
curl "http://localhost:8000/day-view?date=2024-01-15&width=1200&height=1400" -o day-view.png
```

### `GET /health`

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "backend_url": "http://localhost:8080"
}
```

## Installation

### Using Docker

1. Build the image:

    ```bash
    docker build -t calendo-image-generator .
    ```

2. Run the container:

    ```bash
    docker run -p 8000:8000 -e BACKEND_URL=http://localhost:8080 calendo-image-generator
    ```

### Using Python

1. Install dependencies:

    ```bash
    pip install -r requirements.txt
    ```

2. Run the application:

    ```bash
    export BACKEND_URL=http://localhost:8080
    uvicorn main:app --host 0.0.0.0 --port 8000
    ```

## Configuration

The service can be configured using environment variables:

- `BACKEND_URL`: URL of the CalenDO backend API (default: [http://localhost:8080](http://localhost:8080))

## Theme Integration

The generator uses the CalenDO frontend theme colors:

- **Primary**: #6B46C1 (Purple 600)
- **Background**: #FAF5FF (Purple 50)
- **Event Colors**: Based on planning colors from the backend
- **Typography**: System fonts with proper fallbacks

## Image Generation Details

The day view image includes:

1. **Header**: Date display with CalenDO purple theme
2. **Time Grid**: Hour-based grid with time labels
3. **Events**: Positioned events with:
   - Planning colors (left border and background tint)
   - Event title and time
   - Location (if available)
   - Planning name
4. **Smart Layout**: Automatic time range calculation and overlap handling

## Integration with CalenDO

The service automatically fetches:

- Events from `/events` endpoint
- Planning information from `/plannings` endpoint
- Applies planning colors to events
- Filters events for the requested date

## Development

### Running in Development

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Testing

```bash
# Health check
curl http://localhost:8000/health

# Generate today's day view
curl http://localhost:8000/day-view -o today.png

# Generate specific date
curl "http://localhost:8000/day-view?date=2024-01-15" -o specific-date.png
```

## Future Enhancements

- Month view generation
- Week view generation
- Custom themes and styling options
- Export formats (PDF, SVG)
- Event filtering options
- Batch generation for multiple dates
