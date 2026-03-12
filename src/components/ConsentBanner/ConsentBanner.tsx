import React, { useState, useEffect } from "react";
import ConsentService from "../../services/consentService";
import "./ConsentBanner.css";

interface ConsentData {
  functionalCookies: boolean;
  analyticalCookies: boolean;
  dataProcessing: boolean;
  healthDataProcessing: boolean;
  timestamp: Date;
}

const ConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentData>({
    functionalCookies: false,
    analyticalCookies: false,
    dataProcessing: false,
    healthDataProcessing: false,
    timestamp: new Date(),
  });

  useEffect(() => {
    // Check if user has already given consent or if consent is expired
    const hasValidConsent =
      ConsentService.hasConsent() && !ConsentService.isConsentExpired();
    if (!hasValidConsent) {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (consentData: ConsentData) => {
    ConsentService.saveConsent(consentData);
    setShowBanner(false);
  };

  const handleAcceptAll = () => {
    const fullConsent: ConsentData = {
      functionalCookies: true,
      analyticalCookies: true,
      dataProcessing: true,
      healthDataProcessing: true,
      timestamp: new Date(),
    };
    saveConsent(fullConsent);
  };

  const handleAcceptNecessary = () => {
    const necessaryConsent: ConsentData = {
      functionalCookies: true,
      analyticalCookies: false,
      dataProcessing: true,
      healthDataProcessing: false,
      timestamp: new Date(),
    };
    saveConsent(necessaryConsent);
  };

  const handleCustomConsent = () => {
    saveConsent(consent);
  };

  const handleConsentChange = (type: keyof ConsentData, value: boolean) => {
    if (type !== "timestamp") {
      setConsent((prev) => ({
        ...prev,
        [type]: value,
      }));
    }
  };

  if (!showBanner) return null;

  return (
    <div className="consent-banner">
      <div className="consent-banner__overlay">
        <div className="consent-banner__content">
          <h3 className="consent-banner__title">
            🍪 Vi respekterer ditt personvern
          </h3>

          <p className="consent-banner__description">
            Vi bruker nødvendige cookies og behandler personopplysninger for å
            gi deg best mulig opplevelse på vår nettside og for å levere våre
            helsetjenester.
          </p>

          {!showDetails ? (
            <div className="consent-banner__buttons">
              <button
                className="consent-banner__btn consent-banner__btn--accept"
                onClick={handleAcceptAll}
              >
                Godta alle
              </button>
              <button
                className="consent-banner__btn consent-banner__btn--necessary"
                onClick={handleAcceptNecessary}
              >
                Kun nødvendige
              </button>
              <button
                className="consent-banner__btn consent-banner__btn--customize"
                onClick={() => setShowDetails(true)}
              >
                Tilpass valg
              </button>
            </div>
          ) : (
            <div className="consent-banner__details">
              <div className="consent-banner__option">
                <label className="consent-banner__checkbox-label">
                  <input
                    type="checkbox"
                    checked={consent.functionalCookies}
                    onChange={(e) =>
                      handleConsentChange("functionalCookies", e.target.checked)
                    }
                    className="consent-banner__checkbox"
                  />
                  <span className="consent-banner__checkmark"></span>
                  <div>
                    <strong>Funksjonelle cookies (Nødvendig)</strong>
                    <p>Kreves for innlogging og grunnleggende funksjonalitet</p>
                  </div>
                </label>
              </div>

              <div className="consent-banner__option">
                <label className="consent-banner__checkbox-label">
                  <input
                    type="checkbox"
                    checked={consent.dataProcessing}
                    onChange={(e) =>
                      handleConsentChange("dataProcessing", e.target.checked)
                    }
                    className="consent-banner__checkbox"
                  />
                  <span className="consent-banner__checkmark"></span>
                  <div>
                    <strong>Databehandling for booking (Nødvendig)</strong>
                    <p>
                      Behandling av navn, kontaktinfo og adresse for å levere
                      våre tjenester
                    </p>
                  </div>
                </label>
              </div>

              <div className="consent-banner__option">
                <label className="consent-banner__checkbox-label">
                  <input
                    type="checkbox"
                    checked={consent.healthDataProcessing}
                    onChange={(e) =>
                      handleConsentChange(
                        "healthDataProcessing",
                        e.target.checked
                      )
                    }
                    className="consent-banner__checkbox"
                  />
                  <span className="consent-banner__checkmark"></span>
                  <div>
                    <strong>Behandling av helseopplysninger</strong>
                    <p>
                      Lagring av helseinformasjon for å gi deg best mulig
                      behandling
                    </p>
                  </div>
                </label>
              </div>

              <div className="consent-banner__option">
                <label className="consent-banner__checkbox-label">
                  <input
                    type="checkbox"
                    checked={consent.analyticalCookies}
                    onChange={(e) =>
                      handleConsentChange("analyticalCookies", e.target.checked)
                    }
                    className="consent-banner__checkbox"
                  />
                  <span className="consent-banner__checkmark"></span>
                  <div>
                    <strong>Analytiske cookies (Valgfritt)</strong>
                    <p>
                      Hjelper oss å forbedre nettsiden ved å analysere hvordan
                      den brukes
                    </p>
                  </div>
                </label>
              </div>

              <div className="consent-banner__detail-buttons">
                <button
                  className="consent-banner__btn consent-banner__btn--back"
                  onClick={() => setShowDetails(false)}
                >
                  Tilbake
                </button>
                <button
                  className="consent-banner__btn consent-banner__btn--save"
                  onClick={handleCustomConsent}
                >
                  Lagre valg
                </button>
              </div>
            </div>
          )}

          <div className="consent-banner__links">
            <a href="/privacy" className="consent-banner__link">
              Les personvernerklæringen
            </a>
            <span className="consent-banner__separator">•</span>
            <a href="/terms" className="consent-banner__link">
              Vilkår og betingelser
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
