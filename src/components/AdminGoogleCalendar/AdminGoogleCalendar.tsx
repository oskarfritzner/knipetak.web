import React, { useState, useEffect } from "react";
import { GoogleCalendarService } from "../../backend/GoogleCalendar/GoogleCalendarService";
import {
  CalendarEvent,
  CalendarSyncStatus,
} from "../../backend/GoogleCalendar/types/calendar";
import "./AdminGoogleCalendar.css";

interface Props {
  /** Callback when calendar events are loaded */
  onEventsLoaded?: (events: CalendarEvent[]) => void;
  /** Callback when sync status changes */
  onSyncStatusChange?: (status: CalendarSyncStatus) => void;
  /** Optional initial authorization state */
  initialAuthorized?: boolean;
  /** Calendar IDs to display (defaults to the Oskar Fritzner calendar) */
  calendarIds?: string[];
}

interface SyncDetails {
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
}

const AdminGoogleCalendar: React.FC<Props> = ({
  onSyncStatusChange,
  initialAuthorized = false,
  calendarIds = [
    "5a77682778bf92e3a8a9768cc65117703d84ab71547c94d656b693aa4c5130f6@group.calendar.google.com",
  ],
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(initialAuthorized);
  const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus>({
    status: "idle",
    message: "",
  });
  const [availableCalendars, setAvailableCalendars] = useState<
    Array<{ id: string; summary: string }>
  >([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>(
    calendarIds[0],
  );
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [syncDetails, setSyncDetails] = useState<SyncDetails | null>(null);
  const [showSyncDetails, setShowSyncDetails] = useState(false);

  useEffect(() => {
    onSyncStatusChange?.(syncStatus);
  }, [syncStatus, onSyncStatusChange]);

  // Load token and initialize calendar on mount
  useEffect(() => {
    const initializeWithToken = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!apiKey || !clientId) {
          throw new Error("Google Calendar credentials missing");
        }

        const service = GoogleCalendarService.getInstance(apiKey, clientId);
        await service.initialize();

        // Check if we have a valid token in localStorage
        const savedToken = localStorage.getItem(
          "google_calendar_permanent_token",
        );
        if (savedToken) {
          try {
            const tokenData = JSON.parse(savedToken);
            if (tokenData.expires_at > Date.now()) {
              // Token is valid, set it and mark as authorized
              if (window.gapi?.client) {
                window.gapi.client.setToken({
                  access_token: tokenData.access_token,
                });
              }
              setIsAuthorized(true);
              setSyncStatus({
                status: "success",
                message: "Kalender initialisert",
              });

              // Load available calendars
              const calendars = await service.getAvailableCalendars();
              setAvailableCalendars(calendars);

              if (calendars.length > 0 && !selectedCalendarId) {
                setSelectedCalendarId(calendars[0].id);
              }
            } else {
              // Token expired, remove it and request new authorization
              localStorage.removeItem("google_calendar_permanent_token");
              setSyncStatus({
                status: "idle",
                message: "Vennligst koble til Google Kalender",
              });
            }
          } catch (error) {
            console.warn("Error with saved token:", error);
            localStorage.removeItem("google_calendar_permanent_token");
            setSyncStatus({
              status: "idle",
              message: "Vennligst koble til Google Kalender",
            });
          }
        } else {
          setSyncStatus({
            status: "idle",
            message: "Vennligst koble til Google Kalender",
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to initialize calendar";
        setError(errorMessage);
        setSyncStatus({ status: "error", message: errorMessage });
        console.error("Calendar initialization error:", error);
      }
    };

    initializeWithToken();
  }, [selectedCalendarId]);

  const handleSyncGoogleCalendar = async () => {
    setIsLoading(true);
    setError(null);
    setSyncStatus({
      status: "syncing",
      message: "Synkroniserer med Google Calendar...",
    });
    setSyncDetails(null);

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!apiKey || !clientId) {
        throw new Error("Google Calendar credentials missing");
      }

      const service = GoogleCalendarService.getInstance(apiKey, clientId);

      if (!isAuthorized) {
        await service.initialize();
        const authorized = await service.authorize("full");
        if (!authorized) {
          throw new Error("Failed to authorize with Google Calendar");
        }
        setIsAuthorized(true);

        // Load available calendars after authorization
        const calendars = await service.getAvailableCalendars();
        setAvailableCalendars(calendars);

        if (calendars.length > 0 && !selectedCalendarId) {
          setSelectedCalendarId(calendars[0].id);
        }
      }

      // Use selected calendar
      const result = await service.syncExistingBookings(selectedCalendarId);
      setSyncDetails(result.details);

      const message =
        [
          result.created > 0
            ? `${result.created} nye bookinger lagt til`
            : null,
          result.updated > 0 ? `${result.updated} bookinger oppdatert` : null,
          result.deleted > 0
            ? `${result.deleted} duplikate bookinger fjernet`
            : null,
          result.cancelled > 0
            ? `${result.cancelled} kansellerte bookinger fjernet`
            : null,
        ]
          .filter(Boolean)
          .join(", ") || "Ingen endringer";

      setSyncStatus({
        status: "success",
        message: message,
      });

      // Update refresh key to force iframe reload
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sync with Google Calendar";
      setError(errorMessage);
      setSyncStatus({ status: "error", message: errorMessage });
      console.error("Sync error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="google-calendar-page">
      <div className="page-header">
        <h1>Google Kalender Administrasjon</h1>
        <p className="header-description">
          Se og synkroniser bookinger med Google Calendar
        </p>
      </div>

      <div className="admin-calendar-container">
        <div className="admin-calendar-controls">
          {!isAuthorized ? (
            <div className="auth-section">
              <h2>Koble til Google Kalender</h2>
              <p className="auth-description">
                For å komme i gang, koble til din Google Kalender konto. Dette
                lar deg synkronisere bookinger automatisk.
              </p>
              <button
                onClick={handleSyncGoogleCalendar}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? "Kobler til..." : "Koble til Google Kalender"}
              </button>
            </div>
          ) : (
            <div className="sync-section">
              <h2>Kalender Synkronisering</h2>
              {availableCalendars.length > 0 && (
                <div className="calendar-selector">
                  <label htmlFor="calendar-select">
                    Velg kalender å synkronisere med:
                  </label>
                  <select
                    id="calendar-select"
                    value={selectedCalendarId}
                    onChange={(e) => setSelectedCalendarId(e.target.value)}
                  >
                    {availableCalendars.map((calendar) => (
                      <option key={calendar.id} value={calendar.id}>
                        {calendar.summary}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleSyncGoogleCalendar}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading
                  ? "Synkroniserer..."
                  : "Synkroniser med Google Kalender"}
              </button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {syncStatus.message && (
            <div className={`sync-status ${syncStatus.status}`}>
              <span className="status-message">{syncStatus.message}</span>
              {syncDetails && (
                <button
                  className="toggle-details-btn"
                  onClick={() => setShowSyncDetails(!showSyncDetails)}
                >
                  {showSyncDetails ? "Skjul detaljer" : "Vis detaljer"}
                </button>
              )}
            </div>
          )}

          {syncDetails && showSyncDetails && (
            <div className="sync-details">
              {syncDetails.created.length > 0 && (
                <div className="sync-details-section">
                  <h3>Nye bookinger lagt til:</h3>
                  <ul>
                    {syncDetails.created.map((item) => (
                      <li key={item.id}>
                        <div className="booking-summary">{item.summary}</div>
                        <div className="booking-time">
                          <span className="time-label">Fra:</span>{" "}
                          {item.startTime}
                          <br />
                          <span className="time-label">Til:</span>{" "}
                          {item.endTime}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {syncDetails.updated.length > 0 && (
                <div className="sync-details-section">
                  <h3>Oppdaterte bookinger:</h3>
                  <ul>
                    {syncDetails.updated.map((item) => (
                      <li key={item.id}>
                        <div className="booking-summary">{item.summary}</div>
                        <div className="booking-time">
                          <span className="time-label">Fra:</span>{" "}
                          {item.startTime}
                          <br />
                          <span className="time-label">Til:</span>{" "}
                          {item.endTime}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {syncDetails.deleted.length > 0 && (
                <div className="sync-details-section">
                  <h3>Fjernede duplikate bookinger:</h3>
                  <ul>
                    {syncDetails.deleted.map((item) => (
                      <li key={item.id}>
                        <div className="booking-summary">{item.summary}</div>
                        <div className="booking-time">
                          <span className="time-label">Fra:</span>{" "}
                          {item.startTime}
                          <br />
                          <span className="time-label">Til:</span>{" "}
                          {item.endTime}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {syncDetails.cancelled.length > 0 && (
                <div className="sync-details-section cancelled-section">
                  <h3>Kansellerte bookinger fjernet:</h3>
                  <ul>
                    {syncDetails.cancelled.map((item) => (
                      <li key={item.id}>
                        <div className="booking-summary">{item.summary}</div>
                        <div className="booking-time">
                          <span className="time-label">Fra:</span>{" "}
                          {item.startTime}
                          <br />
                          <span className="time-label">Til:</span>{" "}
                          {item.endTime}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {isAuthorized && (
          <div className="calendar-section">
            <h2>Din Google Kalender</h2>
            <div className="calendar-iframe-container">
              <iframe
                key={refreshKey}
                src={`https://calendar.google.com/calendar/embed?src=${selectedCalendarId}&ctz=Europe%2FOslo`}
                style={{ border: 0 }}
                width="100%"
                height="600"
                frameBorder="0"
                scrolling="no"
                title="Google Calendar"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGoogleCalendar;
