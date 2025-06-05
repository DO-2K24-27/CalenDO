package main

import (
	"log"
	"os"

	"github.com/do2024-2047/CalenDO/ical-importer/cmd"
)

func main() {
	if err := cmd.Execute(); err != nil {
		log.Printf("Error: %v", err)
		os.Exit(1)
	}
}
