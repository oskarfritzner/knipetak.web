import { CalendarEvent } from "./types/calendar";
import {
  GoogleCalendarError,
  handleGoogleCalendarError,
} from "./utils/errorHandling";
import { collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

interface SyncResult {
  created: number;
  updated: number;
  deleted: number;
  cancelled: number;
  details: {
    created: Array<{
      id: string;
      summary: string;
      startTime: string;
      endTime: string;
    }>;
    updated: Array<{
      id: string;
      summary: string;
      startTime: string;
      endTime: string;
    }>;
    deleted: Array<{
      id: string;
      summary: string;
      startTime: string;
      endTime: string;
    }>;
    cancelled: Array<{
      id: string;
      summary: string;
      startTime: string;
      endTime: string;
    }>;
  };
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
  created?: string;
}

interface GoogleCalendarErrorResponse {
  status?: number;
  message?: string;
}

export class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  private isInitialized = false;
  private isGapiLoaded = false;
  private isGisLoaded = false;
  private accessToken: string | null = null;
  private static LOCAL_STORAGE_TOKEN_KEY = "google_calendar_permanent_token";

  private constructor(
    private readonly apiKey: string,
    private readonly clientId: string,
  ) {}

  static getInstance(apiKey: string, clientId: string): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService(
        apiKey,
        clientId,
      );
    }
    return GoogleCalendarService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      await this.loadGapiScript();
      await this.loadGisScript();
      await this.initializeGapiClient();
      this.loadSavedToken();
      this.isInitialized = true;
      return true;
    } catch (error) {
      handleGoogleCalendarError(error, "Service initialization");
      return false;
    }
  }

  private async loadGapiScript(): Promise<void> {
    if (this.isGapiLoaded) return;

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isGapiLoaded = true;
        resolve();
      };
      script.onerror = () =>
        reject(new Error("Failed to load Google API script"));
      document.body.appendChild(script);
    });
  }

  private async loadGisScript(): Promise<void> {
    if (this.isGisLoaded) return;

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isGisLoaded = true;
        resolve();
      };
      script.onerror = () =>
        reject(new Error("Failed to load Google Identity Services"));
      document.body.appendChild(script);
    });
  }

  private async initializeGapiClient(): Promise<void> {
    if (!window.gapi) {
      throw new GoogleCalendarError("Google API not loaded");
    }

    try {
      await new Promise<void>((resolve, reject) => {
        window.gapi.load("client", async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.apiKey,
              discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
              ],
            });
            resolve();
          } catch (error) {
            console.error("GAPI client init error:", error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error("GAPI initialization error:", error);
      throw new GoogleCalendarError(
        `Failed to initialize Google API client: ${error}`,
      );
    }
  }

  private loadSavedToken(): void {
    try {
      console.log("Attempting to load saved token...");
      const savedToken = localStorage.getItem(
        GoogleCalendarService.LOCAL_STORAGE_TOKEN_KEY,
      );
      if (savedToken) {
        console.log("Found saved token in localStorage");
        const tokenData = JSON.parse(savedToken);
        console.log("Token data:", {
          expires_at: tokenData.expires_at,
          current_time: Date.now(),
          is_expired: tokenData.expires_at <= Date.now(),
        });

        if (tokenData.expires_at > Date.now()) {
          console.log("Token is valid, setting it...");
          this.accessToken = tokenData.access_token;
          if (window.gapi?.client) {
            window.gapi.client.setToken(tokenData.access_token);
          }
        } else {
          console.log("Token expired, removing from storage");
          localStorage.removeItem(
            GoogleCalendarService.LOCAL_STORAGE_TOKEN_KEY,
          );
          this.accessToken = null;
        }
      } else {
        console.log("No saved token found in localStorage");
      }
    } catch (error) {
      console.warn("Error loading saved token:", error);
      localStorage.removeItem(GoogleCalendarService.LOCAL_STORAGE_TOKEN_KEY);
      this.accessToken = null;
    }
  }

  private saveToken(token: string, expiresIn: number): void {
    try {
      console.log("Saving token with expiration:", { expiresIn });
      const tokenData = {
        access_token: token,
        expires_at: Date.now() + expiresIn * 1000, // Convert seconds to milliseconds
      };
      localStorage.setItem(
        GoogleCalendarService.LOCAL_STORAGE_TOKEN_KEY,
        JSON.stringify(tokenData),
      );
      this.accessToken = token;
      console.log("Token saved successfully");
    } catch (error) {
      console.warn("Error saving token:", error);
    }
  }

  async authorize(
    scope: "readonly" | "events" | "full" = "readonly",
  ): Promise<boolean> {
    if (!window.google?.accounts?.oauth2) {
      throw new GoogleCalendarError("Google Identity Services not loaded");
    }

    try {
      const scopes = {
        readonly: "https://www.googleapis.com/auth/calendar.readonly",
        events: "https://www.googleapis.com/auth/calendar.events",
        full: "https://www.googleapis.com/auth/calendar",
      };

      console.log("Requesting authorization with scope:", scopes[scope]);

      return new Promise((resolve) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: scopes[scope],
          prompt: "consent",
          callback: (response: {
            error?: string;
            access_token?: string;
            expires_in?: number;
          }) => {
            console.log("Authorization response:", response);

            if (response.error) {
              console.error("Authorization error:", response.error);
              resolve(false);
              return;
            }

            if (response.access_token) {
              console.log("Successfully authorized with access token");
              this.accessToken = response.access_token;

              // Save token with expiration
              const expiresIn = response.expires_in || 3600; // Default to 1 hour if not provided
              this.saveToken(response.access_token, expiresIn);

              // Set the token for GAPI client
              if (window.gapi?.client) {
                window.gapi.client.setToken({
                  access_token: response.access_token,
                });
              }

              resolve(true);
              return;
            }

            resolve(false);
          },
        });

        // Request the token
        tokenClient.requestAccessToken();
      });
    } catch (error) {
      console.error("Authorization error:", error);
      return false;
    }
  }

  private async ensureCalendarApiLoaded(): Promise<void> {
    if (!window.gapi?.client?.calendar) {
      try {
        await this.initializeGapiClient();
        // Wait a short moment to ensure calendar API is fully loaded
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!window.gapi?.client?.calendar) {
          throw new GoogleCalendarError("Calendar API failed to load");
        }
      } catch (error) {
        throw new GoogleCalendarError(`Failed to load Calendar API: ${error}`);
      }
    }
  }

  private async ensureAuthorized(): Promise<void> {
    if (!this.accessToken) {
      console.log("No access token found, requesting authorization...");
      const authorized = await this.authorize("full");
      if (!authorized) {
        throw new GoogleCalendarError(
          "Failed to authorize with Google Calendar",
        );
      }
    } else {
      console.log("Using existing access token");
      try {
        // First check if token is expired
        const savedToken = localStorage.getItem(
          GoogleCalendarService.LOCAL_STORAGE_TOKEN_KEY,
        );
        if (savedToken) {
          const tokenData = JSON.parse(savedToken);
          if (tokenData.expires_at <= Date.now()) {
            console.log("Token expired, requesting new authorization...");
            this.accessToken = null;
            localStorage.removeItem(
              GoogleCalendarService.LOCAL_STORAGE_TOKEN_KEY,
            );
            const authorized = await this.authorize("full");
            if (!authorized) {
              throw new GoogleCalendarError("Failed to refresh expired token");
            }
            return;
          }
        }

        // Validate token by making a minimal API call
        await window.gapi.client.calendar.calendarList.list({
          fields: "items(id)",
        });
      } catch (error) {
        console.log("Token validation failed:", error);
        this.accessToken = null;
        localStorage.removeItem(GoogleCalendarService.LOCAL_STORAGE_TOKEN_KEY);

        const authorized = await this.authorize("full");
        if (!authorized) {
          throw new GoogleCalendarError(
            "Failed to reauthorize with Google Calendar",
          );
        }
      }
    }
  }

  async fetchUpcomingEvents(maxResults: number = 10): Promise<CalendarEvent[]> {
    if (!this.isInitialized || !this.accessToken) {
      throw new GoogleCalendarError(
        "Service not initialized or not authorized",
      );
    }

    try {
      await this.ensureCalendarApiLoaded();
      const response = await window.gapi.client.calendar.events.list({
        calendarId: "primary",
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

  async createEvent(
    event: Omit<CalendarEvent, "id">,
    calendarId: string = "primary",
  ): Promise<CalendarEvent> {
    if (!this.isInitialized || !this.accessToken) {
      throw new GoogleCalendarError(
        "Service not initialized or not authorized",
      );
    }

    try {
      await this.ensureCalendarApiLoaded();
      const response = await window.gapi.client.calendar.events.insert({
        calendarId,
        resource: event,
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

  async updateEvent(
    eventId: string,
    event: Partial<CalendarEvent>,
    calendarId: string = "primary",
  ): Promise<CalendarEvent> {
    if (!this.isInitialized || !this.accessToken) {
      throw new GoogleCalendarError(
        "Service not initialized or not authorized",
      );
    }

    try {
      await this.ensureCalendarApiLoaded();

      // First, try to get the event to verify it exists
      try {
        await window.gapi.client.calendar.events.get({
          calendarId,
          eventId: eventId,
        });
      } catch (error: unknown) {
        const calendarError = error as GoogleCalendarErrorResponse;
        // If event doesn't exist (404), create a new one
        if (calendarError.status === 404) {
          console.log(`Event ${eventId} not found, creating new event`);
          const newEvent = await this.createEvent(
            event as Omit<CalendarEvent, "id">,
            calendarId,
          );
          return newEvent;
        }
        throw error;
      }

      // If event exists, update it
      const response = await window.gapi.client.calendar.events.update({
        calendarId,
        eventId,
        resource: event,
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

  async deleteEvent(
    eventId: string,
    calendarId: string = "primary",
  ): Promise<void> {
    if (!this.isInitialized || !this.accessToken) {
      throw new GoogleCalendarError(
        "Service not initialized or not authorized",
      );
    }

    try {
      await this.ensureCalendarApiLoaded();
      await window.gapi.client.calendar.events.delete({
        calendarId,
        eventId,
      });
    } catch (error) {
      handleGoogleCalendarError(error, "Deleting event");
      throw error;
    }
  }

  async getAvailableCalendars(): Promise<
    Array<{ id: string; summary: string }>
  > {
    if (!this.isInitialized) {
      throw new GoogleCalendarError("Service not initialized");
    }

    try {
      await this.ensureCalendarApiLoaded();
      await this.ensureAuthorized();

      const response = await window.gapi.client.calendar.calendarList.list();

      if (!response.result?.items) {
        return [];
      }

      return response.result.items
        .filter((calendar) => calendar.id && calendar.summary)
        .map((calendar) => ({
          id: calendar.id!,
          summary: calendar.summary!,
        }));
    } catch (error) {
      handleGoogleCalendarError(error, "Fetching available calendars");
      throw error;
    }
  }

  async cleanupDuplicateEvents(calendarId?: string): Promise<number> {
    if (!this.isInitialized) {
      throw new GoogleCalendarError("Service not initialized");
    }

    try {
      await this.ensureCalendarApiLoaded();
      await this.ensureAuthorized();

      const targetCalendarId = calendarId || "primary";
      console.log("Cleaning up duplicates in calendar:", targetCalendarId);

      // Get all events from the calendar (including past events)
      const response = await window.gapi.client.calendar.events.list({
        calendarId: targetCalendarId,
        maxResults: 2500,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = (response.result.items ||
        []) as unknown as GoogleCalendarEvent[];
      console.log(`Found ${events.length} events in calendar`);

      // Group events by their start time (within 30 minutes) and similar titles
      const eventGroups = new Map<string, GoogleCalendarEvent[]>();

      for (const event of events) {
        if (!event.summary || !event.start?.dateTime) continue;

        const eventDate = new Date(event.start.dateTime);
        // Round to nearest 30 minutes
        const roundedMinutes = Math.floor(eventDate.getMinutes() / 30) * 30;
        const timeKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}-${eventDate.getHours()}-${roundedMinutes}`;

        // Normalize the title for better matching
        const normalizedTitle = event.summary
          .toLowerCase()
          .replace(/^booking:\s*/i, "") // Remove "Booking:" prefix
          .replace(/\s+/g, " ") // Replace multiple spaces with single space
          .trim();

        // Create a unique key based on time and normalized title
        const groupKey = `${timeKey}_${normalizedTitle}`;

        if (!eventGroups.has(groupKey)) {
          eventGroups.set(groupKey, []);
        }
        eventGroups.get(groupKey)?.push(event);
      }

      let duplicatesRemoved = 0;

      // Process each group of potential duplicates
      for (const [groupKey, groupEvents] of eventGroups) {
        if (groupEvents.length <= 1) continue;

        console.log(
          `Found ${groupEvents.length} potential duplicates for group: ${groupKey}`,
        );

        // Sort by creation time (oldest first)
        groupEvents.sort((a, b) => {
          const timeA = a.created ? new Date(a.created).getTime() : 0;
          const timeB = b.created ? new Date(b.created).getTime() : 0;
          return timeA - timeB;
        });

        // Find the event with the most complete information
        const mostCompleteEvent = groupEvents.reduce((best, current) => {
          const bestScore =
            (best.description?.length || 0) + (best.summary?.length || 0);
          const currentScore =
            (current.description?.length || 0) + (current.summary?.length || 0);
          return currentScore > bestScore ? current : best;
        }, groupEvents[0]);

        console.log(
          `Keeping most complete event: ${mostCompleteEvent.id} (${mostCompleteEvent.summary})`,
        );

        // Update Firebase bookings to use the most complete event ID
        const bookingsRef = collection(db, "bookings");
        const bookingsSnapshot = await getDocs(bookingsRef);

        for (const doc of bookingsSnapshot.docs) {
          const booking = doc.data();
          const calendarEventIds = booking.calendarEventIds || {};
          const existingEventId = calendarEventIds[targetCalendarId];

          // If this booking has one of the duplicate event IDs, update it to use the most complete event ID
          if (groupEvents.some((event) => event.id === existingEventId)) {
            await updateDoc(doc.ref, {
              calendarEventIds: {
                ...calendarEventIds,
                [targetCalendarId]: mostCompleteEvent.id,
              },
            });
            console.log(
              `Updated booking ${doc.id} to use event ID ${mostCompleteEvent.id}`,
            );
          }
        }

        // Delete all other events except the most complete one
        for (const event of groupEvents) {
          if (event.id === mostCompleteEvent.id) continue;

          try {
            await this.deleteEvent(event.id, targetCalendarId);
            duplicatesRemoved++;
            console.log(
              `Removed duplicate event: ${event.id} (${event.summary})`,
            );
          } catch (error) {
            const calendarError = error as GoogleCalendarErrorResponse;
            if (calendarError.status === 410) {
              console.log(`Event ${event.id} already deleted`);
              continue;
            }
            console.warn(
              `Failed to delete duplicate event ${event.id}:`,
              error,
            );
          }
        }
      }

      console.log(`Removed ${duplicatesRemoved} duplicate events`);
      return duplicatesRemoved;
    } catch (error) {
      handleGoogleCalendarError(error, "Cleaning up duplicate events");
      throw error;
    }
  }

  async syncExistingBookings(calendarId?: string): Promise<SyncResult> {
    const result: SyncResult = {
      created: 0,
      updated: 0,
      deleted: 0,
      cancelled: 0,
      details: {
        created: [],
        updated: [],
        deleted: [],
        cancelled: [],
      },
    };

    if (!this.isInitialized) {
      throw new GoogleCalendarError("Service not initialized");
    }

    try {
      await this.ensureCalendarApiLoaded();
      await this.ensureAuthorized();

      const targetCalendarId = calendarId || "primary";
      console.log("Syncing with calendar ID:", targetCalendarId);

      // First clean up duplicates
      const duplicatesRemoved =
        await this.cleanupDuplicateEvents(targetCalendarId);
      result.deleted = duplicatesRemoved;
      console.log(`Removed ${duplicatesRemoved} duplicate events`);

      // Get all bookings from Firebase
      const bookingsRef = collection(db, "bookings");
      const bookingsSnapshot = await getDocs(bookingsRef);
      console.log(`Found ${bookingsSnapshot.size} bookings in Firebase`);

      // Process each booking
      for (const doc of bookingsSnapshot.docs) {
        const booking = doc.data();
        const bookingId = doc.id;
        console.log(`Processing booking ${bookingId}:`, {
          customerName: booking.customerName,
          status: booking.status,
          timeslot: booking.timeslot,
        });

        // Skip if no valid timeslot
        if (!booking.timeslot?.start || !booking.timeslot?.end) {
          console.warn(`Booking ${bookingId} missing timeslot, skipping`);
          continue;
        }

        const startTime = booking.timeslot.start.toDate
          ? booking.timeslot.start.toDate()
          : new Date(booking.timeslot.start);
        const endTime = booking.timeslot.end.toDate
          ? booking.timeslot.end.toDate()
          : new Date(booking.timeslot.end);

        // Handle cancelled bookings
        if (booking.status === "cancelled") {
          const calendarEventIds = booking.calendarEventIds || {};
          const existingEventId = calendarEventIds[targetCalendarId];

          if (existingEventId) {
            try {
              await this.deleteEvent(existingEventId, targetCalendarId);
              result.cancelled++;
              result.details.cancelled.push({
                id: bookingId,
                summary: `Booking: ${
                  booking.customerName || "Unknown customer"
                }`,
                startTime: startTime.toLocaleString("nb-NO", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                endTime: endTime.toLocaleString("nb-NO", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              });

              // Remove event ID from booking
              await updateDoc(doc.ref, {
                calendarEventIds: {
                  ...calendarEventIds,
                  [targetCalendarId]: null,
                },
              });
              console.log(
                `Removed cancelled event ${existingEventId} from calendar ${targetCalendarId}`,
              );
            } catch (error) {
              const calendarError = error as GoogleCalendarErrorResponse;
              if (calendarError.status === 410) {
                console.log(
                  `Event ${existingEventId} already deleted from calendar ${targetCalendarId}`,
                );
                continue;
              }
              console.warn(
                `Failed to delete cancelled event ${existingEventId}:`,
                error,
              );
            }
          }
        } else {
          // If booking is not cancelled, create or update the event
          const calendarEventIds = booking.calendarEventIds || {};
          const existingEventId = calendarEventIds[targetCalendarId];

          if (existingEventId) {
            try {
              // Try to get the event first to see if it exists
              await window.gapi.client.calendar.events.get({
                calendarId: targetCalendarId,
                eventId: existingEventId,
              });

              // If we get here, the event exists, so update it
              const updatedEvent = await this.updateEvent(
                existingEventId,
                {
                  summary: booking.customerName || "Unknown customer",
                  description: booking.description || "",
                  start: {
                    dateTime: startTime.toISOString(),
                    timeZone: "Europe/Oslo",
                  },
                  end: {
                    dateTime: endTime.toISOString(),
                    timeZone: "Europe/Oslo",
                  },
                },
                targetCalendarId,
              );
              result.updated++;
              result.details.updated.push({
                id: bookingId,
                summary: updatedEvent.summary,
                startTime: updatedEvent.start.dateTime,
                endTime: updatedEvent.end.dateTime,
              });
              console.log(
                `Updated event ${existingEventId} in calendar ${targetCalendarId}`,
              );
            } catch (error) {
              const calendarError = error as GoogleCalendarErrorResponse;
              if (calendarError.status === 404) {
                console.log(
                  `Event ${existingEventId} not found in calendar ${targetCalendarId}, creating new event`,
                );
                // Event doesn't exist, create a new one
                const newEvent = await this.createEvent(
                  {
                    summary: booking.customerName || "Unknown customer",
                    description: booking.description || "",
                    start: {
                      dateTime: startTime.toISOString(),
                      timeZone: "Europe/Oslo",
                    },
                    end: {
                      dateTime: endTime.toISOString(),
                      timeZone: "Europe/Oslo",
                    },
                  },
                  targetCalendarId,
                );
                result.created++;
                result.details.created.push({
                  id: bookingId,
                  summary: newEvent.summary,
                  startTime: newEvent.start.dateTime,
                  endTime: newEvent.end.dateTime,
                });

                // Update booking with new event ID
                await updateDoc(doc.ref, {
                  calendarEventIds: {
                    ...calendarEventIds,
                    [targetCalendarId]: newEvent.id,
                  },
                });
                console.log(
                  `Created new event ${newEvent.id} in calendar ${targetCalendarId}`,
                );
              } else {
                console.warn(`Failed to update booking ${bookingId}:`, error);
              }
            }
          } else {
            // No existing event ID, create a new one
            try {
              const newEvent = await this.createEvent(
                {
                  summary: booking.customerName || "Unknown customer",
                  description: booking.description || "",
                  start: {
                    dateTime: startTime.toISOString(),
                    timeZone: "Europe/Oslo",
                  },
                  end: {
                    dateTime: endTime.toISOString(),
                    timeZone: "Europe/Oslo",
                  },
                },
                targetCalendarId,
              );
              result.created++;
              result.details.created.push({
                id: bookingId,
                summary: newEvent.summary,
                startTime: newEvent.start.dateTime,
                endTime: newEvent.end.dateTime,
              });

              // Update booking with new event ID
              await updateDoc(doc.ref, {
                calendarEventIds: {
                  ...calendarEventIds,
                  [targetCalendarId]: newEvent.id,
                },
              });
              console.log(
                `Created new event ${newEvent.id} in calendar ${targetCalendarId}`,
              );
            } catch (error) {
              console.warn(`Failed to create booking ${bookingId}:`, error);
            }
          }
        }
      }

      console.log("Sync completed with results:", {
        created: result.created,
        updated: result.updated,
        deleted: result.deleted,
        cancelled: result.cancelled,
      });

      return result;
    } catch (error) {
      handleGoogleCalendarError(error, "Syncing existing bookings");
      throw error;
    }
  }
}
