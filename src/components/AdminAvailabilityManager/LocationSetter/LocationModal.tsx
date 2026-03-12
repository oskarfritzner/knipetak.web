import React, { useState } from "react";
import { createLocation } from "@/backend/firebase/services/firebase.locationservice";
import type { Location, LocationFormData } from "@/backend/interfaces/Location";
import "./LocationModal.css";

const initialLocationForm: LocationFormData = {
  name: "",
  address: "",
  postalCode: 0,
  city: "",
  area: "",
};

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationCreated: (newLocation: Location) => void;
}

export function LocationModal({
  isOpen,
  onClose,
  onLocationCreated,
}: LocationModalProps) {
  const [locationForm, setLocationForm] =
    useState<LocationFormData>(initialLocationForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsSubmitting(true);
      const locationId = await createLocation(locationForm);
      const newLocation = {
        ...locationForm,
        id: locationId,
        postalCode: locationForm.postalCode ?? 0,
      };
      onLocationCreated(newLocation);
      setLocationForm(initialLocationForm);
      onClose();
    } catch (error) {
      setError("Kunne ikke legge til lokasjon. Prøv igjen senere.");
      console.error("Failed to create location:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Legg til ny lokasjon</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="location-form" onSubmit={handleLocationFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Navn på lokasjon
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={locationForm.name}
              onChange={handleLocationFormChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Adresse (valgfritt)
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={locationForm.address || ""}
              onChange={handleLocationFormChange}
              className="form-input"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="postalCode">
                Postnummer
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                value={locationForm.postalCode}
                onChange={handleLocationFormChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="city">
                By
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={locationForm.city}
                onChange={handleLocationFormChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="area">
                Område
              </label>
              <input
                id="area"
                name="area"
                type="text"
                value={locationForm.area || ""}
                onChange={handleLocationFormChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Lagrer..." : "Legg til lokasjon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
