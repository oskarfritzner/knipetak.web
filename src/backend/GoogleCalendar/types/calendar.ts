export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  status?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

export interface CalendarSyncStatus {
  status: "idle" | "syncing" | "success" | "error";
  message: string;
  count?: number;
}
