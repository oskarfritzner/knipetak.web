// Type definitions for Google API

// Define interface for Google Calendar API request params
interface GapiCalendarParams {
  calendarId?: string;
  eventId?: string;
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  orderBy?: string;
  singleEvents?: boolean;
  showDeleted?: boolean;
  resource?: Record<string, unknown>;
}

// Define interface for API response
interface GapiResponse<T> {
  result: T;
  status: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: string;
}

// Define interface for client init options
interface GapiInitOptions {
  apiKey: string;
  discoveryDocs?: string[];
  clientId?: string;
  scope?: string;
}

// Define interface for OAuth token response
interface TokenResponse {
  error?: string;
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

// Define interface for token client config
interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  prompt?: "consent" | "select_account" | "none";
}

// Define interface for token client
interface TokenClient {
  requestAccessToken: (options?: {
    prompt?: "consent" | "select_account" | "none";
  }) => void;
}

interface Window {
  gapi: {
    load: (lib: string, callback: () => void) => void;
    client: {
      init: (config: GapiInitOptions) => Promise<void>;
      getToken: () => { access_token: string } | null;
      setToken: (token: { access_token: string }) => void;
      calendar: {
        events: {
          list: (
            params: GapiCalendarParams,
          ) => Promise<GapiResponse<{ items: Array<Record<string, unknown>> }>>;
          insert: (
            params: GapiCalendarParams,
          ) => Promise<GapiResponse<Record<string, unknown>>>;
          delete: (params: GapiCalendarParams) => Promise<GapiResponse<void>>;
          update: (
            params: GapiCalendarParams,
          ) => Promise<GapiResponse<Record<string, unknown>>>;
        };
      };
    };
  };
  google: {
    accounts: {
      oauth2: {
        initTokenClient: (config: TokenClientConfig) => TokenClient;
        revoke: (token: string, callback?: () => void) => void;
      };
    };
  };
  tokenClient?: TokenClient;
}
