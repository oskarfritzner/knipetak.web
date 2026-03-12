interface ConsentData {
  functionalCookies: boolean;
  analyticalCookies: boolean;
  dataProcessing: boolean;
  healthDataProcessing: boolean;
  timestamp: Date;
}

interface ConsentPreferences {
  marketing: boolean;
  analytics: boolean;
  functional: boolean;
  health: boolean;
}

const CONSENT_STORAGE_KEY = "gdpr-consent";

export class ConsentService {
  /**
   * Get current user consent from localStorage
   */
  static getConsent(): ConsentData | null {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        timestamp: new Date(parsed.timestamp),
      };
    } catch (error) {
      console.error("Error reading consent data:", error);
      return null;
    }
  }

  /**
   * Save user consent to localStorage
   */
  static saveConsent(consent: ConsentData): void {
    try {
      const consentWithTimestamp = {
        ...consent,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify(consentWithTimestamp)
      );

      // Trigger custom event for other components to listen to
      window.dispatchEvent(
        new CustomEvent("consentUpdated", {
          detail: consentWithTimestamp,
        })
      );
    } catch (error) {
      console.error("Error saving consent data:", error);
    }
  }

  /**
   * Check if user has given consent
   */
  static hasConsent(): boolean {
    return this.getConsent() !== null;
  }

  /**
   * Check if specific consent type is granted
   */
  static hasConsentFor(type: keyof ConsentData): boolean {
    const consent = this.getConsent();
    if (!consent || type === "timestamp") return false;
    return consent[type] === true;
  }

  /**
   * Clear all consent data
   */
  static clearConsent(): void {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("consentCleared"));
  }

  /**
   * Get consent preferences in a simplified format
   */
  static getConsentPreferences(): ConsentPreferences {
    const consent = this.getConsent();
    return {
      marketing: consent?.analyticalCookies || false,
      analytics: consent?.analyticalCookies || false,
      functional: consent?.functionalCookies || false,
      health: consent?.healthDataProcessing || false,
    };
  }

  /**
   * Check if consent is expired (older than 12 months)
   */
  static isConsentExpired(): boolean {
    const consent = this.getConsent();
    if (!consent) return true;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return consent.timestamp < oneYearAgo;
  }

  /**
   * Get consent summary for display
   */
  static getConsentSummary(): string {
    const consent = this.getConsent();
    if (!consent) return "Ikke gitt samtykke";

    const granted = [];
    if (consent.functionalCookies) granted.push("Funksjonelle cookies");
    if (consent.dataProcessing) granted.push("Databehandling");
    if (consent.healthDataProcessing) granted.push("Helseopplysninger");
    if (consent.analyticalCookies) granted.push("Analytiske cookies");

    return granted.length > 0 ? granted.join(", ") : "Kun nødvendige cookies";
  }
}

export default ConsentService;
