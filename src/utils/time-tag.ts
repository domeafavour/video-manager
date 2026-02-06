// Utility functions for time-based tags

/**
 * Check if a tag is a time tag (format: "MM:SS text" or "HH:MM:SS text")
 */
export function isTimeTag(tag: string): boolean {
  return /^\d{1,2}:\d{2}(?::\d{2})?\s+.+/.test(tag);
}

/**
 * Parse time from a time tag (returns seconds)
 */
export function parseTimeFromTag(tag: string): number | null {
  const match = tag.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;
  
  const hours = match[3] ? parseInt(match[1], 10) : 0;
  const minutes = match[3] ? parseInt(match[2], 10) : parseInt(match[1], 10);
  const seconds = match[3] ? parseInt(match[3], 10) : parseInt(match[2], 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format seconds to time string (MM:SS or HH:MM:SS)
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Create a time tag from current time and text
 */
export function createTimeTag(seconds: number, text: string): string {
  return `${formatTime(seconds)} ${text}`;
}
