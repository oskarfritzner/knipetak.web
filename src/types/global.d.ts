interface Window {
  gapi: any;
  google: any;
  tokenClient: any;
  calendarService: {
    syncExistingBookings: (calendarId?: string) => Promise<number>;
    cleanupDuplicateEvents: () => Promise<number>;
    removeBookingEvent: (bookingId: string, eventId: string) => Promise<void>;
    authorizeCalendar: () => Promise<boolean>;
    getAvailableCalendars: () => Promise<Calendar[]>;
  };
}

interface Calendar {
  id: string;
  summary: string;
  description?: string;
  timeZone?: string;
}
