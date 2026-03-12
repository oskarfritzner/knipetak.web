import React, { useState, useEffect } from "react";
import {
  getAllBookings,
  updateBooking,
  cancelBooking,
} from "../../backend/firebase/services/firebase.bookingservice";
import { BookingData } from "../../backend/interfaces/BookingData";
import "./HandleBookings.css";

interface HandleBookingsProps {
  isExpanded: boolean;
}

const HandleBookings: React.FC<HandleBookingsProps> = ({ isExpanded }) => {
  // State management for bookings and filters
  const [filter, setFilter] = useState("today");
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string>("");
  const [historyViewType, setHistoryViewType] = useState<"month" | "year">(
    "month",
  );

  // State for editing and cancellation
  const [editingBooking, setEditingBooking] = useState<BookingData | null>(
    null,
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const allBookings = await getAllBookings();
        setBookings(allBookings);
      } catch (error) {
        console.error("Feil ved henting av bookinger:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Filtering logic for bookings
  const filterBookings = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return bookings
      .filter((booking) => {
        const bookingDate =
          booking.date instanceof Date ? booking.date : new Date(booking.date);

        if (showHistory) {
          const bookingEndTime = new Date(bookingDate);
          bookingEndTime.setMinutes(
            bookingEndTime.getMinutes() + booking.duration,
          );

          if (bookingEndTime >= now) {
            return false;
          }

          if (historyViewType === "year" && selectedHistoryMonth) {
            return bookingDate.getFullYear() === parseInt(selectedHistoryMonth);
          } else if (historyViewType === "month" && selectedHistoryMonth) {
            const [year, month] = selectedHistoryMonth.split("-").map(Number);
            return (
              bookingDate.getFullYear() === year &&
              bookingDate.getMonth() === month - 1
            );
          }
          return false;
        }

        const bookingEndTime = new Date(bookingDate);
        bookingEndTime.setMinutes(
          bookingEndTime.getMinutes() + booking.duration,
        );

        if (bookingEndTime < now) {
          return false;
        }

        if (filter === "today") {
          return bookingDate.toDateString() === now.toDateString();
        } else if (filter === "week") {
          const today = new Date();
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          weekStart.setHours(0, 0, 0, 0);

          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          return bookingDate >= weekStart && bookingDate <= weekEnd;
        } else if (filter === "month") {
          return (
            bookingDate.getMonth() === now.getMonth() &&
            bookingDate.getFullYear() === now.getFullYear()
          );
        }
        return false;
      })
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  };

  // Helper function for formatting time ranges
  const formatTimeRange = (startTime: Date, duration: number) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("nb-NO", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Get available history months for filtering
  const getAvailableHistoryMonths = () => {
    const now = new Date();
    const uniqueMonths = new Set<string>();
    const uniqueYears = new Set<string>();

    bookings.forEach((booking) => {
      const bookingDate =
        booking.date instanceof Date ? booking.date : new Date(booking.date);

      const bookingEndTime = new Date(bookingDate);
      bookingEndTime.setMinutes(bookingEndTime.getMinutes() + booking.duration);

      if (bookingEndTime < now) {
        const monthKey = `${bookingDate.getFullYear()}-${String(
          bookingDate.getMonth() + 1,
        ).padStart(2, "0")}`;
        uniqueMonths.add(monthKey);
        uniqueYears.add(bookingDate.getFullYear().toString());
      }
    });

    return historyViewType === "year"
      ? Array.from(uniqueYears).sort().reverse()
      : Array.from(uniqueMonths).sort().reverse();
  };

  // Format history options for display
  const formatHistoryOption = (value: string) => {
    if (historyViewType === "year") {
      return value;
    } else {
      const [year, month] = value.split("-").map(Number);
      const date = new Date(year, month - 1);
      return date.toLocaleString("nb-NO", { month: "long", year: "numeric" });
    }
  };

  // Handlers for editing and cancelling bookings
  const handleEditClick = (booking: BookingData) => {
    setEditingBooking(booking);
    setShowEditModal(true);
  };

  const handleCancelClick = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setShowCancelModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking || !editingBooking.bookingId) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await updateBooking(editingBooking.bookingId, editingBooking);
      setBookings(
        bookings.map((booking) =>
          booking.bookingId === editingBooking.bookingId
            ? editingBooking
            : booking,
        ),
      );
      setShowEditModal(false);
      setEditingBooking(null);
    } catch (error) {
      console.error("Feil ved oppdatering av booking:", error);
      setErrorMessage(
        "Det oppsto en feil ved oppdatering av booking. Vennligst prøv igjen.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelBookingId) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await cancelBooking(cancelBookingId);
      setBookings(
        bookings.map((booking) =>
          booking.bookingId === cancelBookingId
            ? { ...booking, status: "cancelled" }
            : booking,
        ),
      );
      setShowCancelModal(false);
      setCancelBookingId(null);
    } catch (error) {
      console.error("Feil ved kansellering av booking:", error);
      setErrorMessage(
        "Det oppsto en feil ved kansellering av booking. Vennligst prøv igjen.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingBooking) return;

    const { name, value } = e.target;

    if (name === "address" || name === "city" || name === "postalCode") {
      setEditingBooking({
        ...editingBooking,
        location: {
          ...editingBooking.location,
          [name]: name === "postalCode" ? Number(value) : value,
        },
      });
    } else if (name === "date" || name === "time") {
      const newDate = new Date(editingBooking.date);

      if (name === "date") {
        const [year, month, day] = value.split("-").map(Number);
        newDate.setFullYear(year, month - 1, day);
      } else if (name === "time") {
        const [hours, minutes] = value.split(":").map(Number);
        newDate.setHours(hours, minutes);
      }

      setEditingBooking({
        ...editingBooking,
        date: newDate,
        timeslot: {
          start: newDate,
          end: new Date(newDate.getTime() + editingBooking.duration * 60000),
        },
      });
    } else {
      setEditingBooking({
        ...editingBooking,
        [name]: value,
      });
    }
  };

  const filteredBookings = filterBookings();
  const availableHistoryOptions = getAvailableHistoryMonths();

  if (!isExpanded) {
    return null;
  }

  return (
    <div className="bookings-container">
      <h1 className="bookings-title">Behandlinger Oversikt</h1>

      <div className="view-toggle">
        <button
          className={`toggle-button ${!showHistory ? "active" : ""}`}
          onClick={() => setShowHistory(false)}
        >
          Aktive behandlinger
        </button>
        <button
          className={`toggle-button ${showHistory ? "active" : ""}`}
          onClick={() => setShowHistory(true)}
        >
          Historikk
        </button>
      </div>

      {!showHistory ? (
        <div className="filter-section">
          <label htmlFor="timeFilter">Vis bookinger for: </label>
          <select
            id="timeFilter"
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="today">I dag</option>
            <option value="week">Denne uken</option>
            <option value="month">Denne måneden</option>
          </select>
        </div>
      ) : (
        <div className="filter-section">
          <div className="history-view-toggle">
            <button
              className={`toggle-button ${
                historyViewType === "month" ? "active" : ""
              }`}
              onClick={() => {
                setHistoryViewType("month");
                setSelectedHistoryMonth("");
              }}
            >
              Månedsvisning
            </button>
            <button
              className={`toggle-button ${
                historyViewType === "year" ? "active" : ""
              }`}
              onClick={() => {
                setHistoryViewType("year");
                setSelectedHistoryMonth("");
              }}
            >
              Årsvisning
            </button>
          </div>
          <div className="history-filter">
            <label htmlFor="historySelect">
              Velg {historyViewType === "year" ? "år" : "måned"}:
            </label>
            <select
              id="historySelect"
              className="filter-select"
              value={selectedHistoryMonth}
              onChange={(e) => setSelectedHistoryMonth(e.target.value)}
            >
              <option value="">
                Velg {historyViewType === "year" ? "år" : "måned"}
              </option>
              {availableHistoryOptions.map((option) => (
                <option key={option} value={option}>
                  {formatHistoryOption(option)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Laster bookinger...</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.bookingId} className="booking-item">
                <div className="booking-info">
                  <h3>{booking.customerName}</h3>
                  <p className="booking-time">
                    {booking.date instanceof Date
                      ? booking.date.toLocaleDateString("nb-NO")
                      : new Date(booking.date).toLocaleDateString("nb-NO")}{" "}
                    {formatTimeRange(booking.timeslot.start, booking.duration)}
                  </p>
                  <p className="booking-address">
                    {booking.location.address}, {booking.location.postalCode}{" "}
                    {booking.location.city}
                  </p>
                  <p className="booking-duration">
                    Varighet: {booking.duration} minutter
                  </p>
                  <p className={`booking-status status-${booking.status}`}>
                    Status:{" "}
                    {booking.status === "pending"
                      ? "Venter"
                      : booking.status === "confirmed"
                        ? "Bekreftet"
                        : "Kansellert"}
                  </p>
                  <div className="booking-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(booking)}
                      disabled={booking.status === "cancelled"}
                    >
                      Rediger
                    </button>
                    <button
                      className="cancel-button"
                      onClick={() =>
                        booking.bookingId &&
                        handleCancelClick(booking.bookingId)
                      }
                      disabled={
                        booking.status === "cancelled" || !booking.bookingId
                      }
                    >
                      Kanseller
                    </button>
                  </div>
                </div>
                <div className="booking-contact">
                  <p>E-post: {booking.customerEmail}</p>
                  {booking.customerPhone && (
                    <p>Telefon: {booking.customerPhone}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-bookings">
              <p>
                {showHistory
                  ? `Ingen tidligere behandlinger funnet for valgt ${
                      historyViewType === "year" ? "år" : "måned"
                    }.`
                  : "Ingen aktive bookinger funnet for valgt periode."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Rediger booking</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="date">Dato:</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={
                    editingBooking.date instanceof Date
                      ? editingBooking.date.toISOString().split("T")[0]
                      : new Date(editingBooking.date)
                          .toISOString()
                          .split("T")[0]
                  }
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="time">Tid:</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={
                    editingBooking.timeslot.start instanceof Date
                      ? editingBooking.timeslot.start
                          .toTimeString()
                          .substring(0, 5)
                      : new Date(editingBooking.timeslot.start)
                          .toTimeString()
                          .substring(0, 5)
                  }
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Adresse:</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={editingBooking.location.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="city">By:</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={editingBooking.location.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="postalCode">Postnummer:</label>
                <input
                  type="number"
                  id="postalCode"
                  name="postalCode"
                  value={editingBooking.location.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="submit"
                  className="save-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Lagrer..." : "Lagre endringer"}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBooking(null);
                  }}
                  disabled={isSubmitting}
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Kanseller booking</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <p>Er du sikker på at du vil kansellere denne bookingen?</p>
            <div className="modal-actions">
              <button
                className="confirm-cancel-button"
                onClick={handleCancelSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Kansellerer..." : "Bekreft kansellering"}
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelBookingId(null);
                }}
                disabled={isSubmitting}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandleBookings;
