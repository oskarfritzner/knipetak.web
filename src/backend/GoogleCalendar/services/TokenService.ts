import {
  LOCAL_STORAGE_TOKEN_KEY,
  DEFAULT_TOKEN_EXPIRATION,
} from "../constants/config";

/**
 * Interface for token data structure
 */
interface TokenData {
  access_token: string;
  expires_at: number;
}

/**
 * Service for managing Google Calendar authentication tokens
 * Handles token storage, retrieval, and validation
 */
export class TokenService {
  /**
   * Saves a token to localStorage with expiration time
   * @param token The access token to save
   * @param expiresIn Time until token expiration in seconds
   */
  static saveToken(
    token: string,
    expiresIn: number = DEFAULT_TOKEN_EXPIRATION,
  ): void {
    try {
      const tokenData: TokenData = {
        access_token: token,
        expires_at: Date.now() + expiresIn * 1000, // Convert seconds to milliseconds
      };

      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, JSON.stringify(tokenData));

      // Set token in gapi client if available
      if (window.gapi?.client) {
        window.gapi.client.setToken({ access_token: token });
      }
    } catch (error) {
      console.warn("Error saving token:", error);
    }
  }

  /**
   * Loads and validates a token from localStorage
   * @returns The valid token if found and not expired, null otherwise
   */
  static loadToken(): string | null {
    try {
      const savedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (!savedToken) return null;

      const tokenData: TokenData = JSON.parse(savedToken);

      if (tokenData.expires_at > Date.now()) {
        // Token is valid
        if (window.gapi?.client) {
          window.gapi.client.setToken({ access_token: tokenData.access_token });
        }
        return tokenData.access_token;
      } else {
        // Token expired
        this.removeToken();
        return null;
      }
    } catch (error) {
      console.warn("Error loading token:", error);
      this.removeToken();
      return null;
    }
  }

  /**
   * Removes the token from localStorage
   */
  static removeToken(): void {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
  }

  /**
   * Checks if a valid token exists in localStorage
   * @returns true if a valid token exists, false otherwise
   */
  static hasValidToken(): boolean {
    const token = this.loadToken();
    return token !== null;
  }
}
