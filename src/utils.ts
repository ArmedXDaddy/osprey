
/**
 * Generates a unique ID for use in mock data
 * @returns A string ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Checks if a value is defined (not null or undefined)
 * @param value The value to check
 * @returns Boolean indicating if the value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Safely logs errors to console with additional context
 * @param context The context where the error occurred
 * @param error The error that occurred
 */
export function logError(context: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(`Error in ${context}:`, error.message, error.stack);
  } else {
    console.error(`Error in ${context}:`, error);
  }
}
