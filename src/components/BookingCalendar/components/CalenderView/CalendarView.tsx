import React, { useState, useEffect, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { nb } from "date-fns/locale";
import EventDetails from "../../../../backend/interfaces/availabilityInterfaces/EventDetails";
import { Location as VenueLocation } from "../../../../backend/interfaces/Location";
import "./CalendarView.css";

// Helper function to format date as YYYY-MM-DD
function formatDateForAPI(date: Date): string {
  return date.toLocaleDateString("sv-SE"); // Using Swedish locale which gives us YYYY-MM-DD format
}

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

interface DayInfoCache {
  [key: string]: {
    locationSlots: LocationSlots[];
    eventDetails: EventDetails | null;
  } | null;
}

// Calendar Day component to display information for a single day
interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  dayInfo: {
    locationSlots: LocationSlots[];
    eventDetails: EventDetails | null;
  } | null;
  isLoading: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  initialDataLoaded: boolean;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  isSelected,
  dayInfo,
  isLoading,
  onClick,
  onMouseEnter,
  onMouseLeave,
  initialDataLoaded,
}) => {
  const dayNum = date.getDate();
  const dayOfWeek = date.getDay(); // 0 = søndag, 6 = lørdag
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isDisabled = date < new Date(new Date().setHours(0, 0, 0, 0));
  const hasLocationInfo = dayInfo && dayInfo.locationSlots.length > 0;
  const hasEvent = dayInfo && dayInfo.eventDetails;

  // Check if we've tried to load data for this date
  const isDataAttempted = dayInfo !== undefined;
  const showLoading =
    isLoading ||
    (!isDataAttempted && !isDisabled && isCurrentMonth && !initialDataLoaded);

  // For location display, truncate to first 15 chars if needed
  const getLocationDisplay = () => {
    if (!hasLocationInfo || !dayInfo?.locationSlots?.length) {
      return "Ikke tilgjengelig";
    }

    // Check if we have multiple locations
    if (dayInfo.locationSlots.length > 1) {
      return "Flere steder";
    }

    // Use multiple checks to ensure we get something to display
    const locationData = dayInfo.locationSlots[0];
    const locationName = locationData?.location?.name;

    if (locationName) {
      // We have a proper location name
      return locationName.length > 15
        ? `${locationName.substring(0, 15)}...`
        : locationName;
    } else if (locationData?.location) {
      // Location exists but name is missing
      return "Tilgjengelig";
    } else if (locationData) {
      // We have slot data but location is missing
      return "Tilgjengelig";
    } else {
      // Fallback
      return "Ikke tilgjengelig";
    }
  };

  return (
    <div
      className={`calendar-day ${!isCurrentMonth ? "outside-month" : ""} ${
        isSelected ? "selected" : ""
      } ${isToday(date) ? "today" : ""} ${isDisabled ? "disabled" : ""} ${
        isWeekend ? "weekend" : ""
      }`}
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={isDisabled ? undefined : onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="day-header">
        <span className="day-number">{dayNum}</span>
        <span className="day-name">{format(date, "EEEE", { locale: nb })}</span>
      </div>
      <div className="day-content">
        {showLoading ? (
          <div className="day-loading">
            <div className="mini-spinner"></div>
          </div>
        ) : hasLocationInfo ? (
          <div className="location-info">
            <span className="location-name">{getLocationDisplay()}</span>

            <span className="work-hours">
              {dayInfo?.locationSlots.length > 1
                ? "Flere tidspunkter"
                : `${
                    dayInfo?.locationSlots[0].workHours.startString ||
                    dayInfo?.locationSlots[0].workHours.start
                  }-${
                    dayInfo?.locationSlots[0].workHours.endString ||
                    dayInfo?.locationSlots[0].workHours.end
                  }`}
            </span>
          </div>
        ) : hasEvent ? (
          <div className="event-info">
            <span className="event-indicator">📅</span>
            <span className="event-name">
              {dayInfo?.eventDetails?.name as string}
            </span>
          </div>
        ) : isCurrentMonth && !isDisabled && isDataAttempted ? (
          <div className="no-info">
            {isWeekend ? "Helg - ikke tilgjengelig" : "Ikke tilgjengelig"}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Mobile calendar day component with a different layout
const MobileCalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  isSelected,
  dayInfo,
  isLoading,
  onClick,
  onMouseEnter,
  onMouseLeave,
  initialDataLoaded,
}) => {
  const dayNum = date.getDate();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isDisabled = date < new Date(new Date().setHours(0, 0, 0, 0));
  const hasLocationInfo = dayInfo && dayInfo.locationSlots.length > 0;
  const hasEvent = dayInfo && dayInfo.eventDetails;

  const isDataAttempted = dayInfo !== undefined;
  const showLoading =
    isLoading ||
    (!isDataAttempted && !isDisabled && isCurrentMonth && !initialDataLoaded);

  // For location display, truncate to first 15 chars if needed
  const getLocationDisplay = () => {
    if (!hasLocationInfo || !dayInfo?.locationSlots?.length) {
      return "Ikke tilgjengelig";
    }

    // Check if we have multiple locations
    if (dayInfo.locationSlots.length > 1) {
      return "Flere steder";
    }

    const locationData = dayInfo.locationSlots[0];
    const locationName = locationData?.location?.name;

    if (locationName) {
      return locationName.length > 20
        ? `${locationName.substring(0, 20)}...`
        : locationName;
    } else if (locationData?.location) {
      return "Tilgjengelig";
    } else if (locationData) {
      return "Tilgjengelig";
    } else {
      return "Ikke tilgjengelig";
    }
  };

  // Only render days in the current month
  if (!isCurrentMonth) return null;

  return (
    <div
      className={`mobile-calendar-day ${isSelected ? "selected" : ""} ${
        isToday(date) ? "today" : ""
      } ${isDisabled ? "disabled" : ""} ${isWeekend ? "weekend" : ""}`}
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={isDisabled ? undefined : onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mobile-day-header">
        <div className="mobile-day-info">
          <span className="mobile-day-number">{dayNum}</span>
          <span className="mobile-day-name">
            {format(date, "EEEE", { locale: nb })}
          </span>
        </div>
      </div>
      <div className="mobile-day-content">
        {showLoading ? (
          <div className="day-loading">
            <div className="mini-spinner"></div>
          </div>
        ) : hasLocationInfo ? (
          <div className="location-info">
            <span className="location-name">{getLocationDisplay()}</span>
            <span className="work-hours">
              {dayInfo?.locationSlots.length > 1
                ? "Flere tidspunkter"
                : `${
                    dayInfo?.locationSlots[0].workHours.startString ||
                    dayInfo?.locationSlots[0].workHours.start
                  }-${
                    dayInfo?.locationSlots[0].workHours.endString ||
                    dayInfo?.locationSlots[0].workHours.end
                  }`}
            </span>
          </div>
        ) : hasEvent ? (
          <div className="event-info">
            <span className="event-indicator">📅</span>
            <span className="event-name">
              {dayInfo?.eventDetails?.name as string}
            </span>
          </div>
        ) : isCurrentMonth && !isDisabled && isDataAttempted ? (
          <div className="no-info">
            {isWeekend ? "Helg - ikke tilgjengelig" : "Ikke tilgjengelig"}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Calendar view component
interface CalendarViewProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date, preloadOnly?: boolean) => void;
  dayInfoCache: DayInfoCache;
  loadingDate: string | null;
  onMonthChange: (month: Date) => void;
  initialDataLoaded: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onDateSelect,
  dayInfoCache,
  loadingDate,
  onMonthChange,
  initialDataLoaded,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  // Use a ref to track the hover timeout for debouncing
  const hoverTimeoutRef = useRef<number | null>(null);

  // Create days array including padding days from previous/next months
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Get start of first week (might be in previous month)
  const startDate = new Date(monthStart);
  const day = startDate.getDay();
  // JavaScript days are 0-indexed with Sunday as 0, so adjust for Monday start
  startDate.setDate(startDate.getDate() - (day === 0 ? 6 : day - 1));

  // Get end of last week (might be in next month)
  const endDate = new Date(monthEnd);
  const endDay = endDate.getDay();
  // Add days to get to end of week (Sunday)
  endDate.setDate(endDate.getDate() + (endDay === 0 ? 0 : 7 - endDay));

  const daysInMonth = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // For mobile view, only include days in the current month
  const daysForMobileView = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const goToPreviousMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  };

  // Preload data when mouse enters a day, with debounce
  const handleDayHover = (date: Date) => {
    // Skip past dates and dates outside the current month
    if (
      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
      !isSameMonth(date, currentMonth)
    ) {
      return;
    }

    const dateStr = formatDateForAPI(date);
    if (!dayInfoCache[dateStr] && loadingDate !== dateStr) {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
      }

      // Set a new timeout to delay the loading until user hovers for 300ms
      hoverTimeoutRef.current = window.setTimeout(() => {
        // Only preload data, don't select the date
        onDateSelect(date, true);
        hoverTimeoutRef.current = null;
      }, 300);
    }
  };

  // Handle mouse leaving a day - clear any pending hover timeouts
  const handleDayLeave = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Handle window resize events to toggle between mobile and desktop views
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Cleanup any pending timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Call onMonthChange when the component mounts to start loading data for the current month
  useEffect(() => {
    // Trigger initial month loading when component mounts
    onMonthChange(currentMonth);
  }, []); // Empty dependency array means this runs once on mount

  // Auto-close loading spinner after timeout to prevent infinite loading
  useEffect(() => {
    // Add a timeout to auto-close the loading spinner after a few seconds
    let loadingTimer: number | undefined = undefined;

    if (!initialDataLoaded) {
      loadingTimer = window.setTimeout(() => {
        onMonthChange(currentMonth); // Force refresh of the current month
      }, 5000); // 5 seconds timeout
    }

    return () => {
      if (loadingTimer) {
        window.clearTimeout(loadingTimer);
      }
    };
  }, [initialDataLoaded, currentMonth, onMonthChange]);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="month-nav-button">
          &lt;
        </button>
        <h3>{format(currentMonth, "MMMM yyyy", { locale: nb })}</h3>
        <button onClick={goToNextMonth} className="month-nav-button">
          &gt;
        </button>
      </div>

      {/* Desktop view with 7-column grid */}
      <div className={`desktop-calendar-view ${isMobileView ? "hidden" : ""}`}>
        <div className="weekday-header">
          {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="days-grid">
          {daysInMonth.map((day) => {
            const dateStr = formatDateForAPI(day);
            const isLoading = loadingDate === dateStr;
            const dayInfo = dayInfoCache[dateStr];

            return (
              <CalendarDay
                key={dateStr}
                date={day}
                isCurrentMonth={isSameMonth(day, currentMonth)}
                isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                dayInfo={dayInfo}
                isLoading={isLoading}
                onClick={() => onDateSelect(day, false)}
                onMouseEnter={() => handleDayHover(day)}
                onMouseLeave={() => handleDayLeave()}
                initialDataLoaded={initialDataLoaded}
              />
            );
          })}
        </div>
      </div>

      {/* Mobile view with single column layout */}
      <div className={`mobile-calendar-view ${!isMobileView ? "hidden" : ""}`}>
        <div className="mobile-days-grid">
          {daysForMobileView.map((day) => {
            const dateStr = formatDateForAPI(day);
            const isLoading = loadingDate === dateStr;
            const dayInfo = dayInfoCache[dateStr];

            return (
              <MobileCalendarDay
                key={dateStr}
                date={day}
                isCurrentMonth={true} // All days are in current month for mobile view
                isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                dayInfo={dayInfo}
                isLoading={isLoading}
                onClick={() => onDateSelect(day, false)}
                onMouseEnter={() => handleDayHover(day)}
                onMouseLeave={() => handleDayLeave()}
                initialDataLoaded={initialDataLoaded}
              />
            );
          })}
        </div>
      </div>

      {/* Only show loading overlay if explicitly not loaded */}
      {!initialDataLoaded && (
        <div className="calendar-loading-overlay">
          <div className="spinner"></div>
          <p>
            Laster inn tilgjengelighet for{" "}
            {format(currentMonth, "MMMM yyyy", { locale: nb })}...
          </p>
          <small>Dette kan ta noen sekunder.</small>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
