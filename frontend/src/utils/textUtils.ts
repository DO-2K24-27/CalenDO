/**
 * Utility functions for formatting text content
 */

/**
 * Converts literal \n strings to actual newline characters
 * This handles cases where descriptions contain "\n" as literal strings
 * instead of actual newline characters
 * 
 * @param text - The text that may contain literal \n strings
 * @returns The text with actual newline characters
 */
export const formatNewlines = (text: string): string => {
  if (!text) return text;
  
  // Replace literal \n with actual newline characters
  return text.replace(/\\n/g, '\n');
};

/**
 * Formats text for display by converting newlines and preserving whitespace
 * 
 * @param text - The text to format
 * @returns The formatted text with proper newlines
 */
export const formatTextForDisplay = (text: string): string => {
  if (!text) return text;
  
  return formatNewlines(text);
};
