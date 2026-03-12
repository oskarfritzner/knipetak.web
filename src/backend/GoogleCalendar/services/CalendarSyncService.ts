import { CalendarEvent } from "../types/calendar";
import { DEFAULT_CALENDAR_ID, DEFAULT_TIMEZONE } from "../constants/config";
import { handleGoogleCalendarError } from "../utils/errorHandling";

/**
 * Service for synchronizing calendar events
 * Handles operations like fetching, creating, updating, and deleting events
 */
export class CalendarSyncService {
  /**
   * Fetches upcoming events from the calendar
   * @param maxResults Maximum number of events to retrieve
   * @param calendarId ID of the calendar to fetch from
   * @returns Promise with the list of events
   */
  static async fetchUpcomingEvents(
    maxResults: number = 10,
    calendarId: string = DEFAULT_CALENDAR_ID,
  ): Promise<CalendarEvent[]> {
    if (!window.gapi?.client?.calendar) {
      throw new Error("Google API client not initialized");
    }

    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults,
        orderBy: "startTime",
      });

      return (response.result.items || []).map((item) => ({
        id: item.id as string,
        summary: item.summary as string,
        description: item.description as string,
        start: item.start as { dateTime: string; timeZone: string },
        end: item.end as { dateTime: string; timeZone: string },
        location: item.location as string,
        status: item.status as string,
        attendees: item.attendees as Array<{
          email: string;
          displayName?: string;
        }>,
      }));
    } catch (error) {
      handleGoogleCalendarError(error, "Fetching events");
      return [];
    }
  }

  /**
   * Creates a new event in the calendar
   * @param event Event details to create
   * @param calendarId ID of the calendar to create the event in
   * @returns Promise with the created event
   */
  static async createEvent(
    event: Omit<CalendarEvent, "id">,
    calendarId: string = DEFAULT_CALENDAR_ID,
  ): Promise<CalendarEvent> {
    if (!window.gapi?.client?.calendar) {
      throw new Error("Google API client not initialized");
    }

    try {
      const response = await window.gapi.client.calendar.events.insert({
        calendarId,
        resource: {
          ...event,
          start: {
            ...event.start,
            timeZone: DEFAULT_TIMEZONE,
          },
          end: {
            ...event.end,
            timeZone: DEFAULT_TIMEZONE,
          },
        },
      });

      const result = response.result;
      return {
        id: result.id as string,
        summary: result.summary as string,
        description: result.description as string,
        start: result.start as { dateTime: string; timeZone: string },
        end: result.end as { dateTime: string; timeZone: string },
        location: result.location as string,
        status: result.status as string,
        attendees: result.attendees as Array<{
          email: string;
          displayName?: string;
        }>,
      };
    } catch (error) {
      handleGoogleCalendarError(error, "Creating event");
      throw error;
    }
  }

  /**
   * Updates an existing event in the calendar
   * @param eventId ID of the event to update
   * @param event Updated event details
   * @param calendarId ID of the calendar containing the event
   * @returns Promise with the updated event
   */
  static async updateEvent(
    eventId: string,
    event: Partial<CalendarEvent>,
    calendarId: string = DEFAULT_CALENDAR_ID,
  ): Promise<CalendarEvent> {
    if (!window.gapi?.client?.calendar) {
      throw new Error("Google API client not initialized");
    }

    try {
      const response = await window.gapi.client.calendar.events.update({
        calendarId,
        eventId,
        resource: {
          ...event,
          start: event.start
            ? {
                ...event.start,
                timeZone: DEFAULT_TIMEZONE,
              }
            : undefined,
          end: event.end
            ? {
                ...event.end,
                timeZone: DEFAULT_TIMEZONE,
              }
            : undefined,
        },
      });

      const result = response.result;
      return {
        id: result.id as string,
        summary: result.summary as string,
        description: result.description as string,
        start: result.start as { dateTime: string; timeZone: string },
        end: result.end as { dateTime: string; timeZone: string },
        location: result.location as string,
        status: result.status as string,
        attendees: result.attendees as Array<{
          email: string;
          displayName?: string;
        }>,
      };
    } catch (error) {
      handleGoogleCalendarError(error, "Updating event");
      throw error;
    }
  }

  /**
   * Deletes an event from the calendar
   * @param eventId ID of the event to delete
   * @param calendarId ID of the calendar containing the event
   */
  static async deleteEvent(
    eventId: string,
    calendarId: string = DEFAULT_CALENDAR_ID,
  ): Promise<void> {
    if (!window.gapi?.client?.calendar) {
      throw new Error("Google API client not initialized");
    }

    try {
      await window.gapi.client.calendar.events.delete({
        calendarId,
        eventId,
      });
    } catch (error) {
      handleGoogleCalendarError(error, "Deleting event");
      throw error;
    }
  }
}
