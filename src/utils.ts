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
