import React from "react";
import {
  BookingProvider,
  useBooking,
} from "../../backend/Context/BookingContext";
import "./BookingCalendar.css";

// Import our components
import CalendarView from "./components/CalenderView/CalendarView";
import BookingSlotsPerDay from "./components/BookingSlotsPerDay/BookingSlotsPerDay";
import BookingForm from "./components/BookingForm/BookingForm";
import CompletedBookingComponent from "./components/CompletedBooking/CompletedBooking";

// BookingCalendarContent component that uses the context
const BookingCalendarContent: React.FC = () => {
  const {
    // Core booking state
    selectedDate,
    selectedTime,
    selectedLocation,
    eventDetails,
    locationSlots,

    // Loading state
    isLoading,
    loadingDate,
    initialDataLoaded,
    dayInfoCache,

    // Treatment and booking details
    treatments,
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
  } = useBooking();

  // Return early for the completed booking view
  if (showCompletedBooking) {
    return (
      <CompletedBookingComponent
        bookingId={completedBookingId}
        date={selectedDate!}
        time={selectedTime!}
        treatment={selectedTreatment!}
        duration={selectedDuration!}
        isGroup={isGroupBooking}
        groupSize={groupSize}
        location={selectedLocation!}
        onClose={handleCloseCompletedBooking}
      />
    );
  }

  return (
    <div className="booking-calendar">
      {/* Step 1: Select a date from calendar */}
      <CalendarView
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        dayInfoCache={dayInfoCache}
        loadingDate={loadingDate}
        onMonthChange={handleMonthChange}
        initialDataLoaded={initialDataLoaded}
      />

      {/* Step 2: Display available slots for selected date */}
      {selectedDate && (
        <div id="available-timeslots">
          <BookingSlotsPerDay
            selectedDate={selectedDate}
            isLoading={isLoading}
            locationSlots={locationSlots}
            eventDetails={eventDetails}
            onSlotClick={handleSlotClick}
            selectedTime={selectedTime}
          />
        </div>
      )}

      {/* Step 3: Show booking form once time slot is selected */}
      {selectedDate && selectedTime && selectedLocation && (
        <div id="booking-form">
          <BookingForm
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedLocation={selectedLocation}
            treatments={treatments}
            onConfirm={handleBookingConfirm}
            onCancel={handleCancelBooking}
            isGroupBooking={isGroupBooking}
            setIsGroupBooking={setIsGroupBooking}
            groupSize={groupSize}
            setGroupSize={setGroupSize}
            selectedTreatment={selectedTreatment}
            setSelectedTreatment={setSelectedTreatment}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
            address={address}
            setAddress={setAddress}
            city={city}
            setCity={setCity}
            postalCode={postalCode}
            setPostalCode={setPostalCode}
            isGuestBooking={isGuestBooking}
            guestEmail={guestEmail}
            setGuestEmail={setGuestEmail}
            guestName={guestName}
            setGuestName={setGuestName}
            guestPhone={guestPhone}
            setGuestPhone={setGuestPhone}
            customerMessage={customerMessage}
            setCustomerMessage={setCustomerMessage}
          />
        </div>
      )}
    </div>
  );
};

// The main BookingCalendar component that wraps the content with the provider
const BookingCalendar: React.FC = () => {
  return (
    <BookingProvider>
      <BookingCalendarContent />
    </BookingProvider>
  );
};

export default BookingCalendar;
