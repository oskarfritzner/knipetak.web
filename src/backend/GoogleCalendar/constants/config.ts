/**
 * Configuration constants for Google Calendar integration
 */

/** Key used to store the Google Calendar token in localStorage */
export const LOCAL_STORAGE_TOKEN_KEY = "google_calendar_permanent_token";

/** Default token expiration time in seconds (1 hour) */
export const DEFAULT_TOKEN_EXPIRATION = 3600;

/** Maximum number of events to fetch by default */
export const DEFAULT_MAX_EVENTS = 10;

/** Default calendar ID to use (primary calendar) */
export const DEFAULT_CALENDAR_ID = "primary";

/** Time zone to use for calendar events */
export const DEFAULT_TIMEZONE = "Europe/Oslo";
