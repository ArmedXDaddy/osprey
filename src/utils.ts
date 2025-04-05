
/**
 * Generates a unique ID for use in mock data
 * @returns A string ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
