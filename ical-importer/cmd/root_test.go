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
