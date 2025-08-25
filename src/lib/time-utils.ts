// Utility functions for time formatting

/**
 * Converts 24-hour time format to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (e.g., "14:30" or "14:30-15:45")
 * @returns Time in 12-hour format with AM/PM (e.g., "2:30 PM" or "2:30 PM - 3:45 PM")
 */
export function formatTimeToAMPM(time24: string): string {
  // Handle time ranges (e.g., "14:30-15:45")
  if (time24.includes('-')) {
    const [startTime, endTime] = time24.split('-')
    return `${convertTo12Hour(startTime.trim())} - ${convertTo12Hour(endTime.trim())}`
  }
  
  // Handle single time (e.g., "14:30")
  return convertTo12Hour(time24)
}

/**
 * Converts a single time from 24-hour to 12-hour format
 * @param time - Time in 24-hour format (e.g., "14:30")
 * @returns Time in 12-hour format with AM/PM (e.g., "2:30 PM")
 */
function convertTo12Hour(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  const hour24 = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr, 10)
  
  if (isNaN(hour24) || isNaN(minute)) {
    return time // Return original if invalid
  }
  
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
  
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`
}

/**
 * Formats minutes to hours and minutes display
 * @param minutes - Total minutes
 * @returns Formatted string (e.g., "2h 30m" or "45m")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${mins}m`
}

/**
 * Gets current time in 12-hour format
 * @returns Current time as string (e.g., "2:30 PM")
 */
export function getCurrentTimeAMPM(): string {
  const now = new Date()
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}