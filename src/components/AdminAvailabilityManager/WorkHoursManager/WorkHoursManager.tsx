import { useEffect, useState } from "react";
import {
  getDefaultWorkHours,
  setDefaultWorkHours,
} from "../../../backend/firebase/services/firebase.availabilityservice";
import type { Location } from "../../../backend/interfaces/Location";
import type WeeklySchedule from "../../../backend/interfaces/availabilityInterfaces/WeeklySchedule";
import { TimeSlotUI } from "@/utils/TimeSlotUtils";
import {
  useWeeklyTimeSlots,
  useDefaultLocation,
} from "@/hooks/useTimeSlotManager";
import "./WorkhoursManager.css";
import { LocationModal } from "../LocationSetter/LocationModal";

const DAYS = [
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
  "søndag",
] as const;

// Mapping between Norwegian display names and database keys
const DAY_MAPPING: Record<string, string> = {
  mandag: "monday",
  tirsdag: "tuesday",
  onsdag: "wednesday",
  torsdag: "thursday",
  fredag: "friday",
  lørdag: "saturday",
  søndag: "sunday",
};

interface WorkHoursManagerProps {
  locations: Location[];
  onLocationCreated: (newLocation: Location) => void;
}

export function WorkHoursManager({
  locations,
  onLocationCreated,
}: WorkHoursManagerProps) {
  // Get the default location ID
  const defaultLocation = useDefaultLocation(locations);

  // Setup initial empty schedule
  const initialSchedule = DAYS.reduce((acc, norwegianDay) => {
    const englishDay = DAY_MAPPING[norwegianDay];
    acc[englishDay] = {
      workhours: {
        timeSlots: [],
      },
    };
    return acc;
  }, {} as Record<string, { workhours: { timeSlots: TimeSlotUI[] } }>);

  // Use our custom hook for managing the weekly schedule
  const {
    schedule,
    setSchedule,
    operations: scheduleOps,
  } = useWeeklyTimeSlots(initialSchedule, {
    dayMapping: DAY_MAPPING,
    defaultLocation,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const defaultHours = await getDefaultWorkHours();

        if (defaultHours) {
          // Transform API data to our UI format
          const uiSchedule = DAYS.reduce((acc, norwegianDay) => {
            const englishDay = DAY_MAPPING[norwegianDay];

            // Map the API response to our UI format
            const timeSlots =
              defaultHours?.[englishDay]?.workhours?.timeSlots || [];

            acc[englishDay] = {
              workhours: {
                timeSlots:
                  timeSlots.length > 0
                    ? timeSlots.map((slot) => ({
                        start:
                          typeof slot.start === "string" ? slot.start : "09:00",
                        end: typeof slot.end === "string" ? slot.end : "17:00",
                        location:
                          typeof slot.location === "string"
                            ? slot.location
                            : slot.location?.id || locations[0]?.id || "",
                      }))
                    : [],
              },
            };
            return acc;
          }, {} as Record<string, { workhours: { timeSlots: TimeSlotUI[] } }>);

          setSchedule(uiSchedule);
        }
      } catch (error) {
        setError("Kunne ikke laste data. Prøv igjen senere.");
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [locations, setSchedule]);

  // Use the operation from our hook
  const handleAddTimeSlot = (norwegianDay: string) => {
    scheduleOps.addTimeSlot(norwegianDay, { location: defaultLocation });
  };

  // Use the operation from our hook
  const handleRemoveTimeSlot = (norwegianDay: string, index: number) => {
    scheduleOps.removeTimeSlot(norwegianDay, index);
  };

  const handleTimeChange = (
    norwegianDay: string,
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    scheduleOps.updateTimeSlot(norwegianDay, index, field, value);
  };

  const handleLocationChange = (
    norwegianDay: string,
    index: number,
    locationId: string
  ) => {
    if (locationId === "new") {
      setActiveDay(DAY_MAPPING[norwegianDay]);
      setIsLocationModalOpen(true);
      return;
    }

    scheduleOps.updateTimeSlot(norwegianDay, index, "location", locationId);
  };

  const handleDayOffToggle = (norwegianDay: string, isDayOff: boolean) => {
    scheduleOps.toggleDayOff(norwegianDay, isDayOff, defaultLocation);
  };

  const handleNewLocation = (newLocation: Location) => {
    if (activeDay) {
      // Update all empty locations with the new one
      const daySchedule = schedule[activeDay];
      if (daySchedule) {
        const updatedTimeSlots = daySchedule.workhours.timeSlots.map(
          (slot) => ({
            ...slot,
            location: slot.location === "" ? newLocation.id : slot.location,
          })
        );

        setSchedule((prev) => ({
          ...prev,
          [activeDay]: {
            ...prev[activeDay],
            workhours: {
              timeSlots: updatedTimeSlots,
            },
          },
        }));
      }
    }
    onLocationCreated(newLocation);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);

      // Transform UI timeslots to API format before submitting
      const apiSchedule = Object.entries(schedule).reduce<WeeklySchedule>(
        (acc, [day, daySchedule]) => {
          acc[day] = {
            workhours: {
              timeSlots: daySchedule.workhours.timeSlots.map((slot) => ({
                start: slot.start,
                end: slot.end,
                location: slot.location,
              })),
            },
          };
          return acc;
        },
        {} as WeeklySchedule
      );

      await setDefaultWorkHours(apiSchedule);
      setSuccess("Arbeidstimer ble oppdatert!");
    } catch (error) {
      setError("Kunne ikke oppdatere arbeidstimer. Prøv igjen senere.");
      console.error("Failed to update work hours:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDayExpansion = (day: string) => {
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  if (isLoading) {
    return <div className="work-hours-manager">Laster...</div>;
  }

  return (
    <div className="work-hours-manager">
      <div className="work-hours-header">
        <h2 className="work-hours-title">Standard Arbeidstimer</h2>
        <p className="work-hours-description">
          Her kan du sette dine standard arbeidstimer for hver ukedag. Du kan
          legge til flere tidsperioder per dag med forskjellige lokasjoner.
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="work-hours-schedule">
        <div className="days-grid-workhours">
          {DAYS.map((norwegianDay) => {
            const englishDay = DAY_MAPPING[norwegianDay];
            const isDayOff =
              !schedule[englishDay]?.workhours?.timeSlots?.length;
            const isExpanded = expandedDays.includes(norwegianDay);

            return (
              <div key={norwegianDay} className="day-schedule">
                <div
                  className="day-header"
                  onClick={() => toggleDayExpansion(norwegianDay)}
                >
                  <div className="day-header-content">
                    <svg
                      className={`expand-icon ${isExpanded ? "expanded" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                    <h3 className="day-title">{norwegianDay}</h3>
                  </div>
                  <label
                    className="day-off-toggle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isDayOff}
                      onChange={(e) =>
                        handleDayOffToggle(norwegianDay, e.target.checked)
                      }
                      className="day-off-checkbox"
                    />
                    <span className="day-off-label">Fri</span>
                  </label>
                </div>

                <div
                  className={`schedule-grid ${isDayOff ? "disabled" : ""} ${
                    isExpanded ? "expanded" : ""
                  }`}
                >
                  {!isDayOff &&
                    schedule[englishDay]?.workhours.timeSlots.map(
                      (timeSlot, index) => (
                        <div key={index} className="time-slot">
                          <div className="time-slot-header">
                            <span className="time-slot-title">
                              Tidsperiode {index + 1}
                            </span>
                            {index > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTimeSlot(norwegianDay, index);
                                }}
                                className="remove-slot-button"
                              >
                                Fjern
                              </button>
                            )}
                          </div>

                          <div className="form-group">
                            <label
                              className="form-label"
                              htmlFor={`${norwegianDay}-${index}-start`}
                            >
                              Start
                            </label>
                            <input
                              id={`${norwegianDay}-${index}-start`}
                              type="time"
                              value={timeSlot.start || ""}
                              onChange={(e) =>
                                handleTimeChange(
                                  norwegianDay,
                                  index,
                                  "start",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>

                          <div className="form-group">
                            <label
                              className="form-label"
                              htmlFor={`${norwegianDay}-${index}-end`}
                            >
                              Slutt
                            </label>
                            <input
                              id={`${norwegianDay}-${index}-end`}
                              type="time"
                              value={timeSlot.end || ""}
                              onChange={(e) =>
                                handleTimeChange(
                                  norwegianDay,
                                  index,
                                  "end",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>

                          <div className="form-group">
                            <label
                              className="form-label"
                              htmlFor={`${norwegianDay}-${index}-location`}
                            >
                              Lokasjon
                            </label>
                            <select
                              id={`${norwegianDay}-${index}-location`}
                              value={timeSlot.location || ""}
                              onChange={(e) =>
                                handleLocationChange(
                                  norwegianDay,
                                  index,
                                  e.target.value
                                )
                              }
                              className="form-input"
                            >
                              <option value="">Velg lokasjon</option>
                              {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                  {location.name}
                                </option>
                              ))}
                              <option value="new">
                                + Legg til ny lokasjon
                              </option>
                            </select>
                          </div>
                        </div>
                      )
                    )}

                  {!isDayOff && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTimeSlot(norwegianDay);
                      }}
                      className="add-slot-button"
                    >
                      + Legg til tidsperiode
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => {
            setIsLocationModalOpen(false);
            setActiveDay(null);
          }}
          onLocationCreated={handleNewLocation}
        />

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? "Lagrer..." : "Lagre Arbeidstimer"}
        </button>
      </div>
    </div>
  );
}
