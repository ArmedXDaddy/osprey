
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID
 * @returns A unique string ID
 */
export const generateId = (): string => {
  return uuidv4();
};

