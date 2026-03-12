import { useEffect, useState } from "react";
import { WorkHoursManager } from "./WorkHoursManager/WorkHoursManager";
import { getLocations } from "../../backend/firebase/services/firebase.locationservice";
import type { Location } from "../../backend/interfaces/Location";
import "./AdminAvailabilityManager.css";
import { OverrideManager } from "./OverrideManager/OverrideManager";

type AvailabilitySection = "workHours" | "overrides" | null;

export function AdminAvailabilityManager() {
  const [expandedSection, setExpandedSection] =
    useState<AvailabilitySection>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    async function loadLocations() {
      try {
        const savedLocations = await getLocations();
        setLocations(savedLocations);
      } catch (error) {
        console.error("Failed to load locations:", error);
      }
    }
    loadLocations();
  }, []);

  const handleSectionToggle = (section: AvailabilitySection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleLocationCreated = (newLocation: Location) => {
    setLocations((prev) => [...prev, newLocation]);
  };

  return (
    <div className="admin-availability-manager">
      <h1 className="availability-title">Administrer Tilgjengelighet</h1>
      <p className="availability-description">
        Her kan du administrere arbeidstider og overstyre tidspunkter. Velg en
        seksjon under for å komme i gang.
      </p>

      <div className="availability-sections">
        <div className="section-button-group">
          <button
            className={`section-button ${expandedSection === "workHours" ? "active" : ""}`}
            onClick={() => handleSectionToggle("workHours")}
          >
            <div className="button-content">
              <span className="button-title">Standard Arbeidstider</span>
              <span className="button-description">
                Sett standard arbeidstider for hver ukedag
              </span>
            </div>
            <span className="expand-icon">
              {expandedSection === "workHours" ? "−" : "+"}
            </span>
          </button>

          <button
            className={`section-button ${expandedSection === "overrides" ? "active" : ""}`}
            onClick={() => handleSectionToggle("overrides")}
          >
            <div className="button-content">
              <span className="button-title">Overstyr Tidspunkter</span>
              <span className="button-description">
                Overstyr arbeidstider for spesifikke datoer
              </span>
            </div>
            <span className="expand-icon">
              {expandedSection === "overrides" ? "−" : "+"}
            </span>
          </button>
        </div>

        <div className="section-content">
          {expandedSection === "workHours" && (
            <div className="expanded-section">
              <WorkHoursManager
                locations={locations}
                onLocationCreated={handleLocationCreated}
              />
            </div>
          )}

          {expandedSection === "overrides" && (
            <div className="expanded-section">
              <OverrideManager locations={locations} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
