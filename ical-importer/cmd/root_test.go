package cmd

import (
	"testing"
	"time"

	"github.com/emersion/go-ical"
)

func TestParseDateTimePropertyWithTZID(t *testing.T) {
	prop := ical.NewProp("DTSTART")
	prop.Params.Set(ical.PropTimezoneID, "America/New_York")
	prop.Value = "20260507T090000"

	parsed, err := parseDateTimeProperty(prop)
	if err != nil {
		t.Fatalf("parseDateTimeProperty returned error: %v", err)
	}

	expectedLocation, err := time.LoadLocation("America/New_York")
	if err != nil {
		t.Fatalf("failed to load expected location: %v", err)
	}

	expected := time.Date(2026, time.May, 7, 9, 0, 0, 0, expectedLocation)
	if !parsed.Equal(expected) {
		t.Fatalf("parsed time = %v, want %v", parsed, expected)
	}

	if parsed.Location().String() != "America/New_York" {
		t.Fatalf("parsed location = %q, want %q", parsed.Location().String(), "America/New_York")
	}
}

func TestParseEventMarksAllDayForDateOnlyProperties(t *testing.T) {
	component := ical.NewComponent("VEVENT")
	uid := ical.NewProp("UID")
	uid.Value = "all-day-event"
	component.Props.Set(uid)

	summary := ical.NewProp("SUMMARY")
	summary.Value = "All day test"
	component.Props.Set(summary)

	start := ical.NewProp("DTSTART")
	start.Params.Set("VALUE", "DATE")
	start.Value = "20260507"
	component.Props.Set(start)

	end := ical.NewProp("DTEND")
	end.Params.Set("VALUE", "DATE")
	end.Value = "20260508"
	component.Props.Set(end)

	event, err := parseEvent(component, "planning-id")
	if err != nil {
		t.Fatalf("parseEvent returned error: %v", err)
	}

	if !event.AllDay {
		t.Fatalf("event.AllDay = false, want true")
	}

	expectedStart := time.Date(2026, time.May, 7, 0, 0, 0, 0, time.UTC)
	if !event.StartTime.Equal(expectedStart) {
		t.Fatalf("start time = %v, want %v", event.StartTime, expectedStart)
	}

	expectedEnd := time.Date(2026, time.May, 8, 0, 0, 0, 0, time.UTC)
	if !event.EndTime.Equal(expectedEnd) {
		t.Fatalf("end time = %v, want %v", event.EndTime, expectedEnd)
	}
}
