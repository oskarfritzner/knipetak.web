import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { Treatment } from "../interfaces/Treatment";
import { Location as VenueLocation } from "../interfaces/Location";
import { CustomerLocation } from "../interfaces/Location";
import EventDetails from "../interfaces/availabilityInterfaces/EventDetails";
import { getAvailableSlotsByDate } from "../firebase/services/firebase.availabilityservice";
import { createBooking } from "../firebase/services/firebase.bookingservice";
import { getTreatments } from "../firebase/services/firebase.treatmentservice";
import { getLocations } from "../firebase/services/firebase.locationservice";
import { auth } from "../firebase/services/firebase.authservice";
import { BookingData } from "../interfaces/BookingData";
import { useNavigate } from "react-router-dom";
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import GuestLoginModal from "../../components/BookingCalendar/components/GuestBookingModal/GuestLoginModal";

// Helper function to format dates as YYYY-MM-DD
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

// Define the Context value type
interface BookingContextType {
  // Core booking state
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedLocation: VenueLocation | null;
  dateManuallySelected: boolean;
  eventDetails: EventDetails | null;
  locationSlots: LocationSlots[];

  // Loading state
  isLoading: boolean;
  loadingDate: string | null;
  initialDataLoaded: boolean;
  dayInfoCache: DayInfoCache;

  // Treatment and booking details
  treatments: Treatment[];
  locations: VenueLocation[];
  isGroupBooking: boolean;
  groupSize: number;
  selectedTreatment: Treatment | null;
  selectedDuration: number | null;

  // Form state
  address: string;
  city: string;
  postalCode: number | null;
  isGuestBooking: boolean;
  guestEmail: string;
  guestName: string;
  guestPhone: string;
  customerMessage: string;

  // Booking confirmation
  showCompletedBooking: boolean;
  completedBookingId: string;

  // Action handlers
  handleDateSelect: (date: Date, preloadOnly?: boolean) => void;
  handleSlotClick: (time: string, location: VenueLocation | null) => void;
  handleBookingConfirm: () => void;
  handleCancelBooking: () => void;
  handleCloseCompletedBooking: () => void;
  handleMonthChange: (month: Date) => void;

  // State setters
  setIsGroupBooking: (isGroup: boolean) => void;
  setGroupSize: (size: number) => void;
  setSelectedTreatment: (treatment: Treatment | null) => void;
  setSelectedDuration: (duration: number | null) => void;
  setAddress: (address: string) => void;
  setCity: (city: string) => void;
  setPostalCode: (postalCode: number | null) => void;
  setGuestEmail: (email: string) => void;
  setGuestName: (name: string) => void;
  setGuestPhone: (phone: string) => void;
  setCustomerMessage: (message: string) => void;
}

// Create the context
export const BookingContext = createContext<BookingContextType | undefined>(
  undefined
);

// Create a provider component
interface BookingProviderProps {
  children: React.ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();

  // Core booking state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDate, setLoadingDate] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [locations, setLocations] = useState<VenueLocation[]>([]);
  const [locationSlots, setLocationSlots] = useState<LocationSlots[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<VenueLocation | null>(null);
  const [dayInfoCache, setDayInfoCache] = useState<DayInfoCache>({});
  const [isPreloadingMonth, setIsPreloadingMonth] = useState(false);
  const [pendingDates, setPendingDates] = useState<Date[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [dateManuallySelected, setDateManuallySelected] = useState(false);

  // Add new state for guest login modal
  const [showGuestLoginModal, setShowGuestLoginModal] = useState(false);

  // Ref to track dates currently being fetched
  const fetchingDates = useRef<Set<string>>(new Set());

  // Treatment and group booking state
  const [isGroupBooking, setIsGroupBooking] = useState(false);
  const [groupSize, setGroupSize] = useState<number>(1);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(
    null
  );

  // Form and modal state
  const [showCompletedBooking, setShowCompletedBooking] = useState(false);
  const [completedBookingId, setCompletedBookingId] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [postalCode, setPostalCode] = useState<number | null>(null);
  const [isGuestBooking, setIsGuestBooking] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");

  // Fetch treatments and locations when the component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log("Starting initial data fetch...");

        // First load locations and treatments simultaneously
        const [treatmentsData, locationsData] = await Promise.all([
          getTreatments(),
          getLocations(),
        ]);

        setTreatments(treatmentsData);
        setLocations(locationsData);

        // Once the core data is loaded, preload the current month
        // Use a local date variable for preloading, don't update selectedDate
        const today = new Date();
        const dayInfo = await fetchAvailabilityForDate(today);
        console.log("Preloaded today:", dayInfo);

        // Start preloading the rest of the month
        handleMonthChange(today);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch availability for a specific date
  const fetchAvailabilityForDate = async (date: Date) => {
    const dateStr = formatDateForAPI(date);
    console.log(`Fetching availability for ${dateStr}`);

    // Check if already fetching this date
    if (fetchingDates.current.has(dateStr)) {
      console.log(`Already fetching data for ${dateStr}, skipping`);
      return null;
    }
    fetchingDates.current.add(dateStr);

    // If requesting the current loading date, update the loading state
    if (dateStr === loadingDate) {
      setLoadingDate(dateStr);
    }

    try {
      const result = await getAvailableSlotsByDate(dateStr);

      if (!result) {
        console.log(`No result for ${dateStr}`);
        // Cache negative result so we don't try to fetch it again
        const emptyResult = {
          locationSlots: [],
          eventDetails: null,
        };
        setDayInfoCache((prev) => ({
          ...prev,
          [dateStr]: emptyResult,
        }));
        return emptyResult;
      }

      console.log(
        `Got availability for ${dateStr}:`,
        result.availabilityByLocation.length > 0
          ? `${result.availabilityByLocation.length} locations`
          : "No locations"
      );

      if (result.eventDetails) {
        console.log(`Event for ${dateStr}:`, result.eventDetails);
      }

      // Convert availability data to match our expected interface
      const convertedLocationSlots: LocationSlots[] =
        result.availabilityByLocation.map((slot) => {
          // Find the location by ID if it's a string
          let locationObj: VenueLocation | null = null;
          if (typeof slot.location === "string") {
            locationObj =
              locations.find((loc) => loc.id === slot.location) || null;
          } else {
            locationObj = slot.location;
          }

          // Extract string versions for display if they exist
          const startString =
            "startString" in slot.workHours
              ? (slot.workHours as { startString?: string }).startString
              : "";
          const endString =
            "endString" in slot.workHours
              ? (slot.workHours as { endString?: string }).endString
              : "";

          return {
            location: locationObj,
            workHours: {
              start:
                typeof slot.workHours.start === "string"
                  ? slot.workHours.start
                  : "00:00",
              end:
                typeof slot.workHours.end === "string"
                  ? slot.workHours.end
                  : "00:00",
              // Add the string versions for UI display
              startString:
                startString ||
                (typeof slot.workHours.start === "string"
                  ? slot.workHours.start
                  : "00:00"),
              endString:
                endString ||
                (typeof slot.workHours.end === "string"
                  ? slot.workHours.end
                  : "00:00"),
            },
            availableSlots: slot.availableSlots,
          };
        });

      const dayInfo = {
        locationSlots: convertedLocationSlots,
        eventDetails: result.eventDetails,
      };

      // Cache results for reuse
      setDayInfoCache((prev) => ({
        ...prev,
        [dateStr]: dayInfo,
      }));

      return dayInfo;
    } catch (error) {
      console.error(`Error fetching slots for ${dateStr}:`, error);
      // Cache error as a valid empty result (not null) to prevent repeated retries
      const errorResult = {
        locationSlots: [],
        eventDetails: null,
      };
      setDayInfoCache((prev) => ({
        ...prev,
        [dateStr]: errorResult,
      }));
      return errorResult;
    } finally {
      setLoadingDate(null);
      fetchingDates.current.delete(dateStr);
    }
  };

  // Fetch availability for selected date and update UI
  useEffect(() => {
    if (!selectedDate || !locations.length) return;

    const fetchSlots = async () => {
      setIsLoading(true);
      const dateStr = formatDateForAPI(selectedDate);

      // If we have cached data for this date, use it
      if (dayInfoCache[dateStr]) {
        const cachedData = dayInfoCache[dateStr];
        if (cachedData) {
          setLocationSlots(cachedData.locationSlots);
          setEventDetails(cachedData.eventDetails);
        } else {
          setLocationSlots([]);
          setEventDetails(null);
        }
        setIsLoading(false);
        return;
      }

      const dayInfo = await fetchAvailabilityForDate(selectedDate);

      if (dayInfo) {
        setLocationSlots(dayInfo.locationSlots);

        if (dayInfo.eventDetails) {
          const eventName =
            typeof dayInfo.eventDetails.name === "string"
              ? dayInfo.eventDetails.name
              : "Ukjent arrangement";
          const eventLocation =
            typeof dayInfo.eventDetails.location === "string"
              ? dayInfo.eventDetails.location
              : "Ukjent sted";
          setEventDetails({
            name: eventName,
            location: eventLocation,
          });
        } else {
          setEventDetails(null);
        }
      } else {
        setLocationSlots([]);
        setEventDetails(null);
      }

      setIsLoading(false);
    };

    fetchSlots();
  }, [selectedDate, locations]);

  // Preload data for the current month, but with limited concurrency
  useEffect(() => {
    if (!isPreloadingMonth || !locations.length || pendingDates.length === 0)
      return;

    let isMounted = true;

    // Safety timeout to ensure loading overlay is dismissed even if preloading fails
    const safetyTimer = setTimeout(() => {
      if (isMounted && !initialDataLoaded) {
        // Safety timeout triggered - forcing initialDataLoaded to true
        setIsPreloadingMonth(false);
        setInitialDataLoaded(true);
      }
    }, 5000); // Reduced from 10s to 5s for faster user experience

    // Optimized data loading using batching with higher concurrency
    const loadDataInBatches = async () => {
      // Starting loadDataInBatches
      // Increased max concurrent requests for faster loading
      const MAX_CONCURRENT_REQUESTS = 5; // Increased from 3 to 5
      let successfullyLoaded = 0;
      let failedToLoad = 0;

      // Eagerly load first visible week before loading the rest
      const visibleDatesFirst = [...pendingDates];
      // Sort to prioritize dates in current week
      const today = new Date();
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

      visibleDatesFirst.sort((a, b) => {
        const aInCurrentWeek = a <= endOfWeek;
        const bInCurrentWeek = b <= endOfWeek;

        if (aInCurrentWeek && !bInCurrentWeek) return -1;
        if (!aInCurrentWeek && bInCurrentWeek) return 1;
        return a.getTime() - b.getTime();
      });

      // Replace original pending dates with sorted ones
      setPendingDates(visibleDatesFirst);

      // Continue as long as we have dates to load and the component is still mounted
      while (pendingDates.length > 0 && isMounted) {
        // Take the next batch of dates (up to max number)
        const batchDates = pendingDates.slice(0, MAX_CONCURRENT_REQUESTS);
        setPendingDates((prev) => prev.slice(MAX_CONCURRENT_REQUESTS));
        // Processing batch of dates

        try {
          // Run API calls for all dates in the batch in parallel
          const results = await Promise.allSettled(
            batchDates.map((date) => fetchAvailabilityForDate(date))
          );

          // Set initialDataLoaded to true after processing the first batch
          if (
            successfullyLoaded === 0 &&
            results.some((r) => r.status === "fulfilled")
          ) {
            // As soon as we have some data, make the UI responsive
            setInitialDataLoaded(true);
          }

          // Count successes and failures
          results.forEach((result) => {
            if (result.status === "fulfilled") {
              successfullyLoaded++;
            } else {
              failedToLoad++;
            }
          });
        } catch (error) {
          console.error("Error loading batch of dates:", error);
          failedToLoad += batchDates.length;
          // Continue with next batch even if there's an error
        }

        // Only add a minimal delay to avoid UI freezing
        if (pendingDates.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      // Done loading all dates
      if (isMounted) {
        console.log(
          `Month data loading complete. Successful: ${successfullyLoaded}, Failed: ${failedToLoad}`
        );
        setIsPreloadingMonth(false);
        // Add a small delay to ensure state is updated after isPreloadingMonth
        setTimeout(() => {
          if (isMounted) {
            setInitialDataLoaded(true);
          }
        }, 10);
      }
    };

    loadDataInBatches();

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(safetyTimer); // Clear the safety timeout
    };
  }, [isPreloadingMonth, locations, pendingDates, initialDataLoaded]);

  // Handle month change - only preload data for the current month
  const handleMonthChange = (month: Date) => {
    // Clear existing loading queue to stop unnecessary loading
    setPendingDates([]);
    setIsPreloadingMonth(false);

    // Set initialDataLoaded to false to show the loading spinner
    setInitialDataLoaded(false);

    console.log(
      `Changing month to ${month.toLocaleDateString()}, starting data loading...`
    );

    // Create array of dates for current month
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    // Only include dates from today forward
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const startDate = today > monthStart ? today : monthStart;

    if (startDate > monthEnd) {
      // Month is in the past, nothing to preload
      console.log("Month is in the past, nothing to preload");
      setInitialDataLoaded(true);
      return;
    }

    const datesInMonth = eachDayOfInterval({
      start: startDate,
      end: monthEnd,
    });

    // Clear the cache for all dates in this month to ensure fresh data
    const newCache = { ...dayInfoCache };
    datesInMonth.forEach((date) => {
      const dateStr = formatDateForAPI(date);
      delete newCache[dateStr];
    });
    setDayInfoCache(newCache);

    // All dates need to be loaded since we cleared the cache
    console.log(
      `Generated ${
        datesInMonth.length
      } dates to preload for ${month.toLocaleDateString("nb-NO", {
        month: "long",
        year: "numeric",
      })}`
    );

    if (datesInMonth.length === 0) {
      // Nothing to preload, we can just show the data we have
      console.log("No dates to preload, setting initialDataLoaded to true");
      setInitialDataLoaded(true);
      return;
    }

    // Start the preloading process
    setPendingDates(datesInMonth);
    setIsPreloadingMonth(true);
  };

  // Handle date selection to fetch slot data
  const handleDateSelect = (date: Date, preloadOnly: boolean = false) => {
    // If we're just preloading data, don't update the selected date or UI
    if (!preloadOnly) {
      setSelectedDate(date);
      setSelectedTime(null);
      setSelectedLocation(null);
      setDateManuallySelected(true);

      // Scroll to the timeslots section after a short delay to ensure rendering
      setTimeout(() => {
        const timeslotsSection = document.getElementById("available-timeslots");
        if (timeslotsSection) {
          timeslotsSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300); // Short delay to ensure the section is rendered
    }

    // Always fetch data for the date if we don't have it yet
    const dateStr = formatDateForAPI(date);
    if (!dayInfoCache[dateStr]) {
      fetchAvailabilityForDate(date);
    }
  };

  // Handle timeslot click to select time and location
  const handleSlotClick = (time: string, location: VenueLocation | null) => {
    setSelectedTime(time);
    setSelectedLocation(location);

    // Scroll to booking form after a short delay
    setTimeout(() => {
      const bookingForm = document.getElementById("booking-form");
      if (bookingForm) {
        bookingForm.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 300);
  };

  // Add handlers for guest login modal
  const handleContinueAsGuest = () => {
    setShowGuestLoginModal(false);
    setIsGuestBooking(true);
  };

  const handleCloseGuestLoginModal = () => {
    setShowGuestLoginModal(false);
  };

  // Update handleBookingConfirm
  const handleBookingConfirm = async () => {
    if (!auth.currentUser && !isGuestBooking) {
      setShowGuestLoginModal(true);
      return;
    }

    if (
      !selectedDate ||
      !selectedTime ||
      !selectedTreatment ||
      !selectedLocation
    ) {
      alert("Vennligst fyll ut alle detaljer for bookingen.");
      return;
    }

    if (isGuestBooking) {
      if (!guestEmail || !guestName || !guestPhone) {
        alert("Vennligst fyll ut all gjesteinformasjon.");
        return;
      }
    }

    if (!address || !city || !postalCode) {
      alert("Vennligst fyll ut din adresse, by og postnummer.");
      return;
    }

    if (isGroupBooking && (!groupSize || groupSize < 1)) {
      alert("Vennligst velg en gyldig gruppestørrelse (minimum 1 person).");
      return;
    }

    let duration: number;
    let price: number;
    if (!isGroupBooking) {
      // For individual bookings, use selectedDuration directly
      if (!selectedDuration) {
        alert("Vennligst velg varighet for bookingen.");
        return;
      }
      duration = selectedDuration;
      const durationOption = selectedTreatment.durations.find(
        (d) => d.duration === duration
      );
      if (!durationOption) {
        alert("Valgt varighet er ikke tilgjengelig for denne behandlingen.");
        return;
      }
      price = durationOption.price;
    } else {
      // For group bookings, selectedDuration represents the total duration
      if (!selectedDuration) {
        alert("Vennligst velg total varighet for gruppen.");
        return;
      }
      duration = selectedDuration;
      // Calculate effective duration per person
      const effectiveDuration = duration / groupSize;
      const durationOption = selectedTreatment.durations.find(
        (d) => d.duration === effectiveDuration
      );
      if (!durationOption) {
        alert(
          `Effektiv varighet per person (${effectiveDuration} minutter) er ikke gyldig for valgt behandling.`
        );
        return;
      }
      let pricePerPerson = durationOption.price;
      if (
        groupSize >= selectedTreatment.discounts.groupSize &&
        selectedTreatment.discounts.prices[effectiveDuration.toString()]
      ) {
        pricePerPerson =
          selectedTreatment.discounts.prices[effectiveDuration.toString()];
      }
      price = pricePerPerson * groupSize;
    }

    // Combine the selected date and time (assumes selectedTime is in "HH:MM" format)
    const dateStr = formatDateForAPI(selectedDate);
    const startDateTime = new Date(`${dateStr}T${selectedTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    console.log(`🕒 Creating booking for ${dateStr} at ${selectedTime}`);
    console.log(
      `📅 Booking will be from ${startDateTime.toTimeString()} to ${endDateTime.toTimeString()}`
    );
    console.log(`⏱️ Total duration: ${duration} minutes`);

    // Create a booking location using the BookingLocation interface
    const bookingLocation: CustomerLocation = {
      address,
      city,
      postalCode: Number(postalCode),
    };

    const bookingData: BookingData = {
      customerId: auth.currentUser?.uid || `guest_${Date.now()}`,
      customerEmail: isGuestBooking
        ? guestEmail
        : auth.currentUser?.email || "",
      customerName: isGuestBooking
        ? guestName
        : auth.currentUser?.displayName || "",
      customerPhone: isGuestBooking ? guestPhone : "",
      date: selectedDate,
      duration,
      location: bookingLocation,
      paymentStatus: false,
      price,
      status: "pending",
      customerMessage: customerMessage,
      timeslot: {
        start: startDateTime,
        end: endDateTime,
      },
      treatmentId: selectedTreatment.id,
      isGuestBooking: isGuestBooking,
    };

    try {
      const bookingId = await createBooking(bookingData);
      setCompletedBookingId(bookingId);
      setShowCompletedBooking(true);

      // Add a delay to ensure the booking is registered in the database
      // before refreshing the availability data
      console.log("Waiting for booking to be registered in database...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Refresh availability data for this date to update the cache
      if (selectedDate) {
        // Clear the cache for this date first
        const dateStr = formatDateForAPI(selectedDate);
        setDayInfoCache((prev) => {
          const newCache = { ...prev };
          delete newCache[dateStr];
          return newCache;
        });

        // Then fetch fresh data
        console.log(
          `Refreshing availability data after booking for ${dateStr}...`
        );
        const updatedData = await fetchAvailabilityForDate(selectedDate);

        // Update locationSlots directly to reflect the changes immediately
        if (updatedData) {
          console.log(
            `Updated timeslots received for ${dateStr}:`,
            updatedData.locationSlots.map(
              (l) => `Location: ${l.availableSlots.length} slots`
            )
          );
          setLocationSlots(updatedData.locationSlots);
        } else {
          console.error(`Failed to get updated timeslot data for ${dateStr}`);
        }
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert(
        "Det oppsto en feil ved oppretting av booking, vennligst prøv igjen."
      );
    }
  };

  const handleCloseCompletedBooking = () => {
    // Store the selectedDate before resetting it
    const dateToRefresh = selectedDate;

    // Reset all form state
    setShowCompletedBooking(false);
    setSelectedTime(null);
    setSelectedDate(null);
    setSelectedTreatment(null);
    setSelectedDuration(null);
    setIsGroupBooking(false);
    setGroupSize(1);
    setDateManuallySelected(false);
    setCustomerMessage("");

    // Refresh availability data for all dates in the current month
    // to ensure we have the latest data when user returns to calendar
    if (dateToRefresh) {
      // Clear the cache for the specific date first
      const dateStr = formatDateForAPI(dateToRefresh);
      setDayInfoCache((prev) => {
        const newCache = { ...prev };
        delete newCache[dateStr];
        return newCache;
      });

      // Fetch fresh data for the specific date
      fetchAvailabilityForDate(dateToRefresh);

      // Also refresh the data for the current month by resetting the cache
      // for all dates and triggering a new month preload
      console.log("Refreshing entire month data after booking completion...");
      setDayInfoCache({}); // Clear all cache
      setInitialDataLoaded(false); // Reset loading state
      const today = new Date();
      handleMonthChange(today);
    }

    // Navigate to homepage
    navigate("/");
  };

  const handleCancelBooking = () => {
    // If we have a selected date, refresh its data to ensure we have the latest availability
    if (selectedDate) {
      const dateStr = formatDateForAPI(selectedDate);

      // Add a delay before refreshing to ensure database consistency
      console.log(
        "Preparing to refresh availability data after cancellation..."
      );

      // Clear the cache for this date first
      setDayInfoCache((prev) => {
        const newCache = { ...prev };
        delete newCache[dateStr];
        return newCache;
      });

      // Then fetch fresh data with a delay to ensure database is up to date
      console.log("Refreshing availability data after cancellation...");
      setTimeout(() => {
        fetchAvailabilityForDate(selectedDate).then((updatedData) => {
          if (updatedData) {
            console.log(
              `Updated data received after cancellation for ${dateStr}`
            );
            setLocationSlots(updatedData.locationSlots);
          }
        });
      }, 1000);
    }

    // Reset form-related state but keep the selected date
    setSelectedTime(null);
    setSelectedLocation(null);
  };

  // Create context value
  const contextValue: BookingContextType = {
    // Core booking state
    selectedDate,
    selectedTime,
    selectedLocation,
    dateManuallySelected,
    eventDetails,
    locationSlots,

    // Loading state
    isLoading,
    loadingDate,
    initialDataLoaded,
    dayInfoCache,

    // Treatment and booking details
    treatments,
    locations,
    isGroupBooking,
    groupSize,
    selectedTreatment,
    selectedDuration,

    // Form state
    address,
    city,
    postalCode,
    isGuestBooking,
    guestEmail,
    guestName,
    guestPhone,
    customerMessage,

    // Booking confirmation
    showCompletedBooking,
    completedBookingId,

    // Action handlers
    handleDateSelect,
    handleSlotClick,
    handleBookingConfirm,
    handleCancelBooking,
    handleCloseCompletedBooking,
    handleMonthChange,

    // State setters
    setIsGroupBooking,
    setGroupSize,
    setSelectedTreatment,
    setSelectedDuration,
    setAddress,
    setCity,
    setPostalCode,
    setGuestEmail,
    setGuestName,
    setGuestPhone,
    setCustomerMessage,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
      <GuestLoginModal
        isOpen={showGuestLoginModal}
        onClose={handleCloseGuestLoginModal}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </BookingContext.Provider>
  );
};

// Create a custom hook to use the booking context
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
