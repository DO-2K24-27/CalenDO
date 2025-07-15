from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, timezone
import pytz
import requests
from PIL import Image, ImageDraw, ImageFont
import io
import os
from dataclasses import dataclass
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CalenDO Image Generator", version="1.0.0")

# Configuration
FRANCE_TZ = pytz.timezone('Europe/Paris')
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080")
CALENDO_THEME = {
    "primary": "#6B46C1",
    "primary_dark": "#553C9A", 
    "primary_light": "#805AD5",
    "secondary": "#9F7AEA",
    "tertiary": "#E9D8FD",
    "background": "#FAF5FF",
    "foreground": "#1A202C",
    "surface": "#FFFFFF",
    "error": "#E53E3E",
    "success": "#38A169",
    "warning": "#D69E2E",
    "gray_100": "#F7FAFC",
    "gray_200": "#EDF2F7",
    "gray_300": "#E2E8F0",
    "gray_400": "#CBD5E0",
    "gray_500": "#A0ADB8",
    "gray_600": "#718096",
    "gray_700": "#4A5568",
    "gray_800": "#2D3748",
    "gray_900": "#1A202C"
}

@dataclass
class Event:
    uid: str
    summary: str
    description: str
    location: str
    start_time: str
    end_time: str
    planning_id: str
    planning_color: str = "#8B5CF6"
    planning_name: str = "Default"

@dataclass
class Planning:
    id: str
    name: str
    color: str
    description: str = ""

class DayViewGenerator:
    def __init__(self, width=800, height=1000):
        self.width = width
        self.height = height
        self.hour_height = 60
        self.time_column_width = 80
        self.margin = 20
        self.header_height = 60
        
    def parse_datetime(self, datetime_str: str) -> datetime:
        """Parse datetime string with proper timezone handling"""
        # Remove 'Z' suffix and replace with explicit UTC timezone
        if datetime_str.endswith('Z'):
            datetime_str = datetime_str[:-1] + '+00:00'
        
        # Parse the datetime with timezone information
        dt = datetime.fromisoformat(datetime_str)
        
        # Convert to France timezone
        france_dt = dt.astimezone(FRANCE_TZ)
        
        return france_dt
        
    def get_local_date(self, datetime_str: str) -> date:
        """Get local date from datetime string"""
        france_dt = self.parse_datetime(datetime_str)
        return france_dt.date()
        
    def get_local_time_components(self, datetime_str: str) -> tuple:
        """Get hour and minute components in France timezone"""
        france_dt = self.parse_datetime(datetime_str)
        return france_dt.hour, france_dt.minute
    
    def get_display_time_components(self, datetime_str: str, target_date: date) -> tuple:
        """Get hour and minute components for display, handling midnight correctly"""
        france_dt = self.parse_datetime(datetime_str)
        
        # Check if this datetime is midnight of the day after target_date
        if france_dt.hour == 0 and france_dt.minute == 0:
            # Check if this is actually the end of the target day (midnight transition)
            if france_dt.date() > target_date:
                # This is midnight of the next day, so it represents 24:00 of the current day
                return 24, 0
        
        return france_dt.hour, france_dt.minute
        
    def hex_to_rgb(self, hex_color):
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def get_font(self, size=14, bold=False):
        """Get font with fallback"""
        try:
            if bold:
                return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
            else:
                return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
        except:
            return ImageFont.load_default()
    
    def wrap_text(self, text, font, max_width):
        """Wrap text to fit within max_width, return list of lines"""
        if not text:
            return []
        
        # Create temporary draw object for text measurement
        temp_draw = ImageDraw.Draw(Image.new('RGB', (1, 1)))
        
        # First try the whole text
        text_bbox = temp_draw.textbbox((0, 0), text, font=font)
        if (text_bbox[2] - text_bbox[0]) <= max_width:
            return [text]
        
        # Split text into words and wrap
        words = text.split()
        lines = []
        current_line = []
        
        for word in words:
            test_line = ' '.join(current_line + [word])
            test_bbox = temp_draw.textbbox((0, 0), test_line, font=font)
            test_width = test_bbox[2] - test_bbox[0]
            
            if test_width <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                    current_line = [word]
                else:
                    # Single word is too long, truncate it
                    lines.append(word[:max(1, max_width // 10)] + "...")
                    current_line = []
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return lines
    
    def calculate_time_range(self, events, target_date: date):
        """Calculate optimal time range based on events"""
        if not events:
            return 8, 18  # Default 8 AM to 6 PM
            
        start_times = []
        end_times = []
        
        for event in events:
            start_hour, start_minute = self.get_local_time_components(event.start_time)
            end_hour, end_minute = self.get_display_time_components(event.end_time, target_date)
            
            start_times.append(start_hour)
            end_times.append(end_hour)
            
            logger.info(f"Event time components: {start_hour}:{start_minute:02d} - {end_hour}:{end_minute:02d}")
        
        start_hour = max(0, min(start_times) - 1)
        end_hour = min(24, max(end_times) + 1)
        
        logger.info(f"Calculated time range: {start_hour}:00 - {end_hour}:00")
        return start_hour, end_hour
    
    def draw_header(self, draw, target_date):
        """Draw the header with date"""
        header_rect = [0, 0, self.width, self.header_height]
        draw.rectangle(header_rect, fill=self.hex_to_rgb(CALENDO_THEME["primary"]))
        
        # Date text
        date_text = target_date.strftime("%A, %B %d, %Y")
        font = self.get_font(20, bold=True)
        
        # Calculate text position (centered)
        text_bbox = draw.textbbox((0, 0), date_text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_x = (self.width - text_width) // 2
        text_y = (self.header_height - (text_bbox[3] - text_bbox[1])) // 2
        
        draw.text((text_x, text_y), date_text, fill="white", font=font)
    
    def draw_time_grid(self, draw, start_hour, end_hour):
        """Draw the time grid"""
        visible_hours = end_hour - start_hour
        grid_height = visible_hours * self.hour_height
        
        # Background
        grid_rect = [0, self.header_height, self.width, self.header_height + grid_height]
        draw.rectangle(grid_rect, fill=self.hex_to_rgb(CALENDO_THEME["background"]))
        
        # Time column background
        time_col_rect = [0, self.header_height, self.time_column_width, self.header_height + grid_height]
        draw.rectangle(time_col_rect, fill=self.hex_to_rgb(CALENDO_THEME["gray_100"]))
        
        # Draw time labels and grid lines
        font = self.get_font(12)
        
        for i in range(visible_hours + 1):
            y = self.header_height + i * self.hour_height
            
            # Horizontal grid line
            draw.line([(0, y), (self.width, y)], fill=self.hex_to_rgb(CALENDO_THEME["gray_300"]), width=1)
            
            if i < visible_hours:
                hour = start_hour + i
                display_hour = hour % 24
                
                # Format time
                if display_hour == 0:
                    time_text = "12 AM"
                elif display_hour < 12:
                    time_text = f"{display_hour} AM"
                elif display_hour == 12:
                    time_text = "12 PM"
                else:
                    time_text = f"{display_hour - 12} PM"
                
                # Draw time text
                text_bbox = draw.textbbox((0, 0), time_text, font=font)
                text_width = text_bbox[2] - text_bbox[0]
                text_x = (self.time_column_width - text_width) // 2
                text_y = y + 5
                
                draw.text((text_x, text_y), time_text, fill=self.hex_to_rgb(CALENDO_THEME["gray_600"]), font=font)
        
        # Vertical separator line
        draw.line([(self.time_column_width, self.header_height), 
                  (self.time_column_width, self.header_height + grid_height)], 
                 fill=self.hex_to_rgb(CALENDO_THEME["gray_300"]), width=1)
    
    def calculate_event_positions(self, events):
        """Calculate proper positioning for overlapping events - matches frontend logic"""
        if not events:
            return []
        
        # Group events by planning_id to maintain consistent positioning
        events_by_planning = {}
        for event in events:
            planning_id = event.planning_id
            if planning_id not in events_by_planning:
                events_by_planning[planning_id] = []
            events_by_planning[planning_id].append(event)
        
        # Sort planning groups by the earliest event start time in each planning
        def get_earliest_event_time(planning_id):
            planning_events = events_by_planning[planning_id]
            earliest_times = [self.parse_datetime(e.start_time) for e in planning_events]
            return min(earliest_times)
        
        sorted_planning_ids = sorted(events_by_planning.keys(), key=get_earliest_event_time)
        
        # Assign base column ranges for each planning
        planning_column_map = {}
        for index, planning_id in enumerate(sorted_planning_ids):
            planning_column_map[planning_id] = index
        
        # Sort all events by start time for overlap detection
        sorted_events = sorted(events, key=lambda e: self.parse_datetime(e.start_time))
        
        positioned_events = []
        active_events_by_planning = {}
        
        for event in sorted_events:
            event_start = self.parse_datetime(event.start_time)
            event_end = self.parse_datetime(event.end_time)
            planning_id = event.planning_id
            base_planning_column = planning_column_map[planning_id]
            
            # Initialize active events for this planning if not exists
            if planning_id not in active_events_by_planning:
                active_events_by_planning[planning_id] = []
            
            # Remove events that have ended from this planning
            still_active = []
            for active_event in active_events_by_planning[planning_id]:
                active_end = self.parse_datetime(active_event['event'].end_time)
                if active_end > event_start:
                    still_active.append(active_event)
            active_events_by_planning[planning_id] = still_active
            
            # Find the first available sub-column within this planning's range
            used_sub_columns = set()
            for active_event in still_active:
                sub_col = active_event['column'] - base_planning_column
                used_sub_columns.add(sub_col)
            
            sub_column = 0
            while sub_column in used_sub_columns:
                sub_column += 1
            
            column = base_planning_column + sub_column
            
            positioned_event = {
                'event': event,
                'column': column,
                'total_columns': 0  # Will be calculated after processing all events
            }
            
            positioned_events.append(positioned_event)
            active_events_by_planning[planning_id].append(positioned_event)
        
        # Calculate total columns needed by finding overlapping events across all plannings
        for pos_event in positioned_events:
            event_start_time = self.parse_datetime(pos_event['event'].start_time)
            event_end_time = self.parse_datetime(pos_event['event'].end_time)
            
            # Find all events that overlap with this event
            overlapping_events = []
            for other_pos_event in positioned_events:
                other_start_time = self.parse_datetime(other_pos_event['event'].start_time)
                other_end_time = self.parse_datetime(other_pos_event['event'].end_time)
                
                # Check if events overlap
                if other_start_time < event_end_time and other_end_time > event_start_time:
                    overlapping_events.append(other_pos_event)
            
            if overlapping_events:
                max_column = max(oe['column'] for oe in overlapping_events)
                total_columns = max_column + 1
                
                # Update total columns for all overlapping events
                for overlapping_event in overlapping_events:
                    overlapping_event['total_columns'] = max(overlapping_event['total_columns'], total_columns)
        
        return positioned_events
    
    def draw_event(self, draw, event, start_hour, end_hour, target_date, column=0, total_columns=1):
        """Draw a single event"""
        start_dt = self.parse_datetime(event.start_time)
        end_dt = self.parse_datetime(event.end_time)
        
        # Calculate position using display time components
        start_hour_display, start_minute_display = self.get_local_time_components(event.start_time)
        end_hour_display, end_minute_display = self.get_display_time_components(event.end_time, target_date)
        
        start_minutes = start_hour_display * 60 + start_minute_display
        end_minutes = end_hour_display * 60 + end_minute_display
        range_start_minutes = start_hour * 60
        range_end_minutes = end_hour * 60
        
        # Clamp event times to visible range
        visible_start_minutes = max(start_minutes, range_start_minutes)
        visible_end_minutes = min(end_minutes, range_end_minutes)
        
        # Ensure valid time range
        if visible_start_minutes >= visible_end_minutes:
            return  # Event is completely outside visible range
        
        # Calculate duration and check for extremely long events
        duration_minutes = visible_end_minutes - visible_start_minutes
        max_reasonable_duration = 24 * 60  # 24 hours in minutes
        
        if duration_minutes > max_reasonable_duration:
            # For extremely long events, cap the duration to prevent coordinate issues
            visible_end_minutes = visible_start_minutes + max_reasonable_duration
            logger.warning(f"Event duration capped to {max_reasonable_duration} minutes for drawing")
        
        top = self.header_height + ((visible_start_minutes - range_start_minutes) / 60) * self.hour_height
        height = ((visible_end_minutes - visible_start_minutes) / 60) * self.hour_height
        
        # Event positioning with proper column support
        available_width = self.width - self.time_column_width - 2 * self.margin
        event_width = available_width / total_columns
        left = self.time_column_width + self.margin + (column * event_width)
        
        # Ensure minimum height and valid coordinates
        height = max(height, 30)
        
        # Add safety checks for coordinate calculations
        if not all(isinstance(x, (int, float)) and not (isinstance(x, float) and (x != x or x == float('inf') or x == float('-inf'))) 
                  for x in [left, top, height, event_width]):
            logger.error("Invalid coordinate values detected, skipping event")
            return
        
        # Convert to integers and validate coordinates
        try:
            left = int(left)
            top = int(top)
            height = int(height)
            event_width = int(event_width)
        except (ValueError, OverflowError):
            logger.error("Error converting coordinates to integers, skipping event")
            return
        
        # Validate coordinates to prevent drawing errors
        if left < 0 or top < 0 or height <= 0 or event_width <= 0:
            return
        
        # Ensure we don't draw outside the image bounds
        max_bottom = self.height - 20
        if top >= max_bottom:
            return  # Event starts below visible area
            
        if top + height > max_bottom:
            height = max_bottom - top
        
        if height <= 0:
            return
        
        # Calculate rectangle coordinates with validation
        x1, y1 = left, top
        x2, y2 = left + event_width, top + height
        
        # Ensure valid rectangle (x2 > x1 and y2 > y1)
        if x2 <= x1 or y2 <= y1:
            return
        
        # Draw event background
        event_rect = [x1, y1, x2, y2]
        event_color = self.hex_to_rgb(event.planning_color)
        
        # Create a lighter background color
        bg_color = tuple(min(255, c + 100) for c in event_color)
        draw.rectangle(event_rect, fill=bg_color, outline=event_color, width=2)
        
        # Draw left border (thicker)
        border_rect = [x1, y1, x1 + 4, y2]
        draw.rectangle(border_rect, fill=event_color)
        
        # Draw event text
        font_title = self.get_font(14, bold=True)
        font_detail = self.get_font(10)
        
        # Available width for text (accounting for padding)
        text_width = event_width - 16  # 8px padding on each side
        
        # Title with wrapping
        title_y = y1 + 5
        current_y = title_y
        if event.summary:
            title_lines = self.wrap_text(event.summary, font_title, text_width)
            for line in title_lines:
                if current_y + 16 > y2 - 5:  # Check if we have space
                    break
                draw.text((x1 + 8, current_y), line, fill=self.hex_to_rgb(CALENDO_THEME["foreground"]), font=font_title)
                current_y += 16
        
        # Time (format in local timezone)
        time_text = f"{start_dt.strftime('%H:%M')} - {end_dt.strftime('%H:%M')}"
        current_y += 4  # Add small spacing
        if current_y + 12 <= y2 - 5:
            draw.text((x1 + 8, current_y), time_text, fill=self.hex_to_rgb(CALENDO_THEME["gray_600"]), font=font_detail)
            current_y += 15
        
        # Location (if available and space allows)
        if event.location and current_y + 12 <= y2 - 5:
            location_lines = self.wrap_text(f"@ {event.location}", font_detail, text_width)
            for line in location_lines:
                if current_y + 12 > y2 - 5:
                    break
                draw.text((x1 + 8, current_y), line, fill=self.hex_to_rgb(CALENDO_THEME["gray_600"]), font=font_detail)
                current_y += 12
        
        # Planning name (if height allows)
        if height > 70 and current_y + 12 <= y2 - 5:
            planning_lines = self.wrap_text(f"• {event.planning_name}", font_detail, text_width)
            for line in planning_lines:
                if current_y + 12 > y2 - 5:
                    break
                draw.text((x1 + 8, current_y), line, fill=self.hex_to_rgb(CALENDO_THEME["gray_500"]), font=font_detail)
                current_y += 12
    
    def generate_day_view(self, events: List[Event], target_date: date) -> Image.Image:
        """Generate a day view image"""
        logger.info(f"Generating day view for {target_date} with {len(events)} events")
        
        # Log event details for debugging
        for event in events:
            logger.info(f"Event: {event.uid}, {event.start_time} - {event.end_time}")
        
        # Calculate time range
        start_hour, end_hour = self.calculate_time_range(events, target_date)
        logger.info(f"Time range: {start_hour}:00 - {end_hour}:00")
        
        # Adjust image height based on time range
        visible_hours = end_hour - start_hour
        required_height = self.header_height + visible_hours * self.hour_height + 40
        self.height = max(self.height, required_height)
        logger.info(f"Image dimensions: {self.width}x{self.height}")
        
        # Create image
        image = Image.new('RGB', (self.width, self.height), self.hex_to_rgb(CALENDO_THEME["background"]))
        draw = ImageDraw.Draw(image)
        
        # Draw header
        self.draw_header(draw, target_date)
        
        # Draw time grid
        self.draw_time_grid(draw, start_hour, end_hour)
        
        # Calculate proper event positions
        event_positions = self.calculate_event_positions(events)
        logger.info(f"Event positions calculated: {len(event_positions)} positioned events")
        
        # Draw events with proper positioning
        for i, pos in enumerate(event_positions):
            try:
                logger.info(f"Drawing event {i+1}/{len(event_positions)}: {pos['event'].uid}")
                self.draw_event(draw, pos['event'], start_hour, end_hour, target_date, pos['column'], pos['total_columns'])
            except Exception as e:
                logger.error(f"Error drawing event {pos['event'].uid}: {e}")
                # Continue with other events instead of failing completely
                continue
        
        # Add footer
        footer_y = self.height - 30
        footer_text = "Generated by CalenDO Image Generator"
        font = self.get_font(10)
        draw.text((self.margin, footer_y), footer_text, fill=self.hex_to_rgb(CALENDO_THEME["gray_500"]), font=font)
        
        return image

async def fetch_events_from_backend(target_date: date) -> List[Event]:
    """Fetch events from the CalenDO backend"""
    try:
        # Format date for API call
        date_str = target_date.strftime("%Y-%m-%d")
        
        # Fetch events
        events_response = requests.get(f"{BACKEND_URL}/api/events")
        events_response.raise_for_status()
        events_data = events_response.json()
        
        # Fetch plannings
        plannings_response = requests.get(f"{BACKEND_URL}/api/plannings")
        plannings_response.raise_for_status()
        plannings_data = plannings_response.json()
        
        # Create planning lookup
        planning_lookup = {p["id"]: Planning(
            id=p["id"],
            name=p["name"],
            color=p["color"],
            description=p.get("description", "")
        ) for p in plannings_data}
        
        # Create a temporary generator instance for timezone utilities
        temp_generator = DayViewGenerator()
        
        # Filter events for target date and create Event objects
        target_events = []
        for event_data in events_data:
            # Get the local date for this event
            event_date = temp_generator.get_local_date(event_data["start_time"])
            if event_date == target_date:
                planning = planning_lookup.get(event_data["planning_id"])
                target_events.append(Event(
                    uid=event_data["uid"],
                    summary=event_data["summary"],
                    description=event_data["description"],
                    location=event_data["location"],
                    start_time=event_data["start_time"],
                    end_time=event_data["end_time"],
                    planning_id=event_data["planning_id"],
                    planning_color=planning.color if planning else "#8B5CF6",
                    planning_name=planning.name if planning else "Default"
                ))
        
        return target_events
    
    except requests.RequestException as e:
        logger.error(f"Failed to fetch data from backend: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch data from backend")
    except Exception as e:
        logger.error(f"Error processing events: {e}")
        raise HTTPException(status_code=500, detail="Error processing events")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "CalenDO Image Generator API", "version": "1.0.0"}

@app.get("/day-view")
async def generate_day_view_image(
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format (default: today)"),
    width: int = Query(800, description="Image width in pixels"),
    height: int = Query(1000, description="Image height in pixels")
):
    """Generate a day view image for the specified date"""
    try:
        # Parse date
        if date:
            try:
                target_date = datetime.strptime(date, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        else:
            # Use France timezone for default date
            target_date = datetime.now(FRANCE_TZ).date()
        
        # Fetch events
        events = await fetch_events_from_backend(target_date)
        
        # Generate image
        generator = DayViewGenerator(width=width, height=height)
        image = generator.generate_day_view(events, target_date)
        
        # Convert to bytes
        img_bytes = io.BytesIO()
        image.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        return Response(
            content=img_bytes.getvalue(),
            media_type="image/png",
            headers={
                "Content-Disposition": f"inline; filename=day-view-{target_date.strftime('%Y-%m-%d')}.png"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating day view: {e}")
        raise HTTPException(status_code=500, detail="Error generating day view image")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "backend_url": BACKEND_URL}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
