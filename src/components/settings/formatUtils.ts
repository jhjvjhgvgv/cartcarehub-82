
/**
 * Formats a date string into a localized date and time format
 * @param dateString ISO date string
 * @returns Formatted date and time string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
