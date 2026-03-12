/**
 * Google Calendar OAuth scopes
 * These scopes define the level of access the application has to the user's Google Calendar
 */

export const GOOGLE_CALENDAR_SCOPES = {
  /** Read-only access to calendar events */
  readonly: "https://www.googleapis.com/auth/calendar.readonly",

  /** Access to create, read, update, and delete calendar events */
  events: "https://www.googleapis.com/auth/calendar.events",

  /** Full access to the calendar, including calendar settings and sharing */
  full: "https://www.googleapis.com/auth/calendar",
} as const;

/** Type representing the available scope levels */
export type GoogleCalendarScope = keyof typeof GOOGLE_CALENDAR_SCOPES;
