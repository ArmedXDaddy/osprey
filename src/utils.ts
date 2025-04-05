
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

/**
 * Safe access to potentially undefined nested properties
 * @param obj The object to check
 * @param defaultValue Default value to return if path doesn't exist
 * @param path Property path to check
 * @returns The value at path or defaultValue if path doesn't exist
 */
export function safeAccess(obj: any, defaultValue: any, ...path: string[]) {
  let current = obj;
  
  for (const key of path) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current === undefined || current === null ? defaultValue : current;
}

/**
 * Checks if an object has all required properties
 * @param obj Object to check
 * @param props Array of required property names
 * @returns true if all properties exist and are not null/undefined
 */
export function hasRequiredProps(obj: any, props: string[]): boolean {
  if (!obj || typeof obj !== 'object') return false;
  
  return props.every(prop => {
    const value = obj[prop];
    return value !== undefined && value !== null;
  });
}
