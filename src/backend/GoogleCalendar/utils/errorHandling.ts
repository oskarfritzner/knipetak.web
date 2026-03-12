export class GoogleCalendarError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly context?: string,
  ) {
    super(message);
    this.name = "GoogleCalendarError";
  }
}

/**
 * Handles errors from Google Calendar API operations
 * @param error The error object from the API
 * @param operation The operation that failed (for logging)
 * @throws Error with a user-friendly message
 */
export function handleGoogleCalendarError(
  error: unknown,
  operation: string,
): void {
  console.error(`Google Calendar error during ${operation}:`, error);

  if (error instanceof Error) {
    // Handle specific Google Calendar API errors
    if (error.message.includes("Not Authorized")) {
      throw new Error("Please sign in to access Google Calendar");
    } else if (error.message.includes("Invalid Value")) {
      throw new Error("Invalid calendar event data provided");
    } else if (error.message.includes("Rate Limit Exceeded")) {
      throw new Error("Too many requests. Please try again later");
    } else if (error.message.includes("Calendar not found")) {
      throw new Error("The specified calendar could not be found");
    }
  }

  // Generic error message for unknown errors
  throw new Error(
    `Failed to ${operation.toLowerCase()}. Please try again later.`,
  );
}
