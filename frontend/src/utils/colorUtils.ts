/**
 * Generate a color based on a string input (like event title)
 * This uses a simple hash function to generate consistent colors
 */
export const generateColorFromString = (input: string): string => {
  // Use only the first 5 characters for color generation
  const shortInput = input.substring(0, 5);
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < shortInput.length; i++) {
    const char = shortInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert hash to positive number
  hash = Math.abs(hash);
  
  // Generate RGB values with good contrast
  const hue = hash % 360;
  const saturation = 45 + (hash % 30); // 45-75% saturation
  const lightness = 85 + (hash % 10); // 85-95% lightness for background
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Generate a darker text color based on the background color
 */
export const generateTextColorFromBackground = (backgroundColor: string): string => {
  // Extract hue from the background color HSL
  const hueMatch = backgroundColor.match(/hsl\((\d+),/);
  if (!hueMatch) return '#374151'; // Default gray-700
  
  const hue = parseInt(hueMatch[1]);
  return `hsl(${hue}, 70%, 25%)`; // Much darker version for text
};

/**
 * Get colors for an event based on its title
 */
export const getEventColors = (eventTitle: string): { bg: string; text: string } => {
  // Generate unique colors based on the title
  const backgroundColor = generateColorFromString(eventTitle);
  const textColor = generateTextColorFromBackground(backgroundColor);
  
  return {
    bg: backgroundColor,
    text: textColor
  };
};
