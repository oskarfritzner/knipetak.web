/**
 * Utility functions for Google Calendar integration
 */

// Interface for calendar events
export interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    date?: string;
  };
  end: {
    dateTime: string;
    date?: string;
  };
  location?: string;
  description?: string;
}

/**
 * Fetches upcoming events from Google Calendar
 * @param maxResults Maximum number of events to retrieve
 * @returns Promise with the list of events
 */
export const fetchUpcomingEvents = async (
  maxResults: number = 10,
): Promise<CalendarEvent[]> => {
  if (!window.gapi || !window.gapi.client || !window.gapi.client.calendar) {
    throw new Error("Google API client not initialized");
  }

  try {
    const response = await window.gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: maxResults,
      orderBy: "startTime",
    });

    // Validate and convert the response items to CalendarEvent objects
    return ((response.result.items as unknown[]) || []).map((item) => {
      const eventItem = item as Record<string, unknown>;
      // Validate that the item has required properties
      if (
        typeof eventItem.id !== "string" ||
        typeof eventItem.summary !== "string" ||
        !eventItem.start ||
        !eventItem.end
      ) {
        console.warn("Event item missing required properties:", eventItem);
        throw new Error("Invalid event data received from Google Calendar API");
      }

      return eventItem as unknown as CalendarEvent;
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
};

/**
 * Creates a new event in Google Calendar
 * @param event Event details
 * @returns Promise with the created event
 */
export const createCalendarEvent = async (event: {
  summary: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
}): Promise<CalendarEvent> => {
  if (!window.gapi || !window.gapi.client || !window.gapi.client.calendar) {
    throw new Error("Google API client not initialized");
  }

  try {
    const response = await window.gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    const result = response.result as Record<string, unknown>;

    // Validate that the result has required properties
    if (
      typeof result.id !== "string" ||
      typeof result.summary !== "string" ||
      !result.start ||
      !result.end
    ) {
      console.warn("Event result missing required properties:", result);
      throw new Error("Invalid event data received from Google Calendar API");
    }

    return result as unknown as CalendarEvent;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
};

/**
 * Formats a date string for display
 * @param dateTime ISO date string with time
 * @param date ISO date string without time
 * @returns Formatted date string
 */
export const formatCalendarDateTime = (
  dateTime?: string,
  date?: string,
): string => {
  if (!dateTime && !date) return "N/A";

  const eventDate = dateTime
    ? new Date(dateTime)
    : date
      ? new Date(date)
      : new Date();
  return eventDate.toLocaleString("nb-NO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: dateTime ? "2-digit" : undefined,
    minute: dateTime ? "2-digit" : undefined,
  });
};

/**
 * Converts a booking to a Google Calendar event
 * @param booking Booking details
 * @returns Calendar event object ready for API
 */
export const bookingToCalendarEvent = (booking: {
  treatment: { name: string };
  date: Date;
  time: string;
  duration: number;
  location: {
    address: string;
    city: string;
    postalCode: number;
  };
  customerName?: string;
  isGroup?: boolean;
  groupSize?: number;
}) => {
  // Parse the time string (format: HH:MM)
  const [hours, minutes] = booking.time.split(":").map(Number);

  // Create start date
  const startDate = new Date(booking.date);
  startDate.setHours(hours, minutes, 0, 0);

  // Create end date (start date + duration in minutes)
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + booking.duration);

  // Format location
  const location = `${booking.location.address}, ${booking.location.postalCode} ${booking.location.city}`;

  // Create description
  let description = `Behandling: ${booking.treatment.name}\nVarighet: ${booking.duration} minutter`;
  if (booking.isGroup) {
    description += `\nGruppebooking: Ja\nAntall personer: ${booking.groupSize}`;
  }
  if (booking.customerName) {
    description += `\nKunde: ${booking.customerName}`;
  }

  return {
    summary: `${booking.treatment.name} - ${
      booking.isGroup ? "Gruppe" : "Individuell"
    } booking`,
    location,
    description,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: "Europe/Oslo",
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: "Europe/Oslo",
    },
  };
};
