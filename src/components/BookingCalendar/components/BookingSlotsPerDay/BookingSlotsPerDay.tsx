import React from "react";
import { Location as VenueLocation } from "../../../../backend/interfaces/Location";
import EventDetails from "../../../../backend/interfaces/availabilityInterfaces/EventDetails";
import "./BookingSlotsPerDay.css";

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

interface LocationSlots {
  location: VenueLocation | null;
  workHours: {
    start: string;
    end: string;
    startString?: string;
    endString?: string;
  };
  availableSlots: string[];
}

interface BookingSlotsPerDayProps {
  selectedDate: Date | null;
  isLoading: boolean;
  locationSlots: LocationSlots[];
  eventDetails: EventDetails | null;
  onSlotClick: (time: string, location: VenueLocation | null) => void;
  selectedTime: string | null;
}

const BookingSlotsPerDay: React.FC<BookingSlotsPerDayProps> = ({
  selectedDate,
  isLoading,
  locationSlots,
  eventDetails,
  onSlotClick,
  selectedTime,
}) => {
  // Format date to Norwegian format
  const formatDateNorwegian = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("nb-NO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLocationDisplay = (location: VenueLocation | null): string => {
    return location?.name || "Ukjent lokasjon";
  };

  if (!selectedDate) {
    return null;
  }

  return (
    <div className="booking-slots-container booking-slots-component">
      <h3>Tilgjengelige tider for {formatDateNorwegian(selectedDate)}</h3>
      {eventDetails ? (
        <p>
          📅 Helene deltar på <strong>{eventDetails["name"] as string}</strong>{" "}
          på {eventDetails["location"] as string}
        </p>
      ) : isLoading ? (
        <div className="timeslots-loading-container">
          <LoadingSpinner />
        </div>
      ) : locationSlots.length > 0 ? (
        <div className="locations-grid">
          {locationSlots.map((locationSlot, index) => (
            <div key={index} className="location-slots">
              <h4>📍 {handleLocationDisplay(locationSlot.location)}</h4>
              <p className="work-hours">
                Arbeidstid:{" "}
                {locationSlot.workHours.startString ||
                  locationSlot.workHours.start}{" "}
                -{" "}
                {locationSlot.workHours.endString || locationSlot.workHours.end}
              </p>
              {locationSlot.availableSlots.length > 0 ? (
                <div className="timeslot-grid">
                  {locationSlot.availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => onSlotClick(slot, locationSlot.location)}
                      className={`time-slot-button ${
                        selectedTime === slot ? "selected" : ""
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-slots-message">
                  Ingen ledige tider for denne plasseringen. Alle tider kan være
                  booket eller reservert.
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-slots-container">
          <p className="no-slots-message">
            Ingen tilgjengelige tider denne dagen.
          </p>
          <p className="no-slots-suggestion">
            Dette kan være fordi alle tider er booket eller fordi det ikke er
            planlagt noen arbeidstid på denne datoen. Det er også mulig at en
            eksisterende booking blokkerer tilgjengelige tider med 15 minutters
            reisebuffer.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingSlotsPerDay;
