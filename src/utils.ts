
export const logError = (location: string, error: any) => {
  console.error(`[ERROR] ${location}:`, error);
  // If the error is wrapped in another error, also log the inner error
  if (error?.cause) {
    console.error(`[ERROR] ${location} cause:`, error.cause);
  }
  // If the error has additional data, log it
  if (error?.additional) {
    console.error(`[ERROR] ${location} additional data:`, error.additional);
  }
};

/**
 * Generates a random ID string
 * @returns A random string that can be used as an ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
