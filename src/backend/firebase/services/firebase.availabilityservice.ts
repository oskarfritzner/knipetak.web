import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  Timestamp,
  setDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import app from "../firebase";

import WorkHours from "../../interfaces/availabilityInterfaces/WorkHours";
import OverrideData from "../../interfaces/availabilityInterfaces/OverrideData";
import EventDetails from "../../interfaces/availabilityInterfaces/EventDetails";
import WeeklySchedule from "../../interfaces/availabilityInterfaces/WeeklySchedule";
import DefaultAvailability from "../../interfaces/availabilityInterfaces/DefaultAvailability";
import AvailabilityResult from "../../interfaces/availabilityInterfaces/AvailabilityResult";
import { getTreatments } from "./firebase.treatmentservice";

const db = getFirestore(app);

// Get how many hours Norway (Oslo) is ahead of UTC on a specific date
function getOsloOffsetForDate(date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    timeZoneName: "short",
  });
  const parts = dtf.formatToParts(date);
  const tzName = parts.find((p) => p.type === "timeZoneName")?.value;
  if (tzName === "CET") return 1;
  if (tzName === "CEST") return 2;
  return 1; // fallback
}

// Get the exact start and end of a day in Norwegian time (converted to UTC)
function getOsloDayBounds(dateStr: string): {
  startOfDay: Date;
  endOfDay: Date;
} {
  const [year, month, day] = dateStr.split("-").map(Number);
  const tempDate = new Date(dateStr + "T00:00:00");
  const osloOffset = getOsloOffsetForDate(tempDate);
  const startOfDay = new Date(
    Date.UTC(year, month - 1, day, 0 - osloOffset, 0, 0)
  );
  const endOfDay = new Date(
    Date.UTC(year, month - 1, day + 1, 0 - osloOffset, 0, 0)
  );
  return { startOfDay, endOfDay };
}

/**
 * Utility function to generate time slots.
 * The slots are generated from start to end with a given interval (in minutes),
 * excluding any slots whose time strings appear in the bookedSlots array.
 */
const generateTimeSlots = (
  start: string,
  end: string,
  bookedRanges: { start: Date; end: Date }[],
  interval: number = 30,
  minDuration: number = 30 // Default minimum treatment duration is 30 minutes
): string[] => {
  if (!start || !end || start === "" || end === "") {
    return []; // Handle empty strings for start or end
  }

  // Generate time slots excluding booked ranges
  console.log(`- Minimum treatment duration: ${minDuration} minutes`);

  const slots: string[] = [];
  const startTime = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);

  // Convert all booked times to normalized comparison times (on a standard date)
  const normalizedBookedRanges = bookedRanges.map((range) => {
    // Extract only the time portion (HH:MM:SS) and normalize to a standard date
    const startTimeStr = range.start.toTimeString().substring(0, 8); // Using HH:MM:SS for precision
    const endTimeStr = range.end.toTimeString().substring(0, 8);

    return {
      start: new Date(`1970-01-01T${startTimeStr}`),
      end: new Date(`1970-01-01T${endTimeStr}`),
    };
  });

  // Debug normalized ranges
  console.log("Normalized booked ranges for comparison:");
  normalizedBookedRanges.forEach((range) => {
    console.log(
      `- ${range.start.toTimeString()} to ${range.end.toTimeString()}`
    );
  });

  // Generate all potential slots
  const allPotentialSlots: string[] = [];
  for (
    let time = startTime;
    time < endTime;
    time = new Date(time.getTime() + interval * 60000)
  ) {
    allPotentialSlots.push(time.toTimeString().substring(0, 5)); // "HH:MM"
  }

  // Generate potential time slots

  // Check each potential slot against all bookings
  allPotentialSlots.forEach((timeStr) => {
    // Create a slot time range for this potential slot
    const slotStart = new Date(`1970-01-01T${timeStr}:00`);

    // Calculate end time based on minimum treatment duration
    const slotEnd = new Date(slotStart.getTime() + minDuration * 60000);

    // Check if this slot overlaps with any booking
    let isOverlapping = false;
    for (const range of normalizedBookedRanges) {
      // A slot overlaps if:
      // 1. The slot starts before a booking ends AND
      // 2. The booking starts before the slot ends
      if (slotStart < range.end && range.start < slotEnd) {
        isOverlapping = true;
        console.log(
          `Slot ${timeStr} overlaps with booking ${range.start
            .toTimeString()
            .substring(0, 5)}-${range.end
            .toTimeString()
            .substring(0, 5)} (with min duration ${minDuration} min)`
        );
        break;
      }
    }

    if (!isOverlapping) {
      slots.push(timeStr);
    }
  });

  console.log(`Final available slots: ${slots.join(", ")}`);
  return slots;
};

// Get available slots for a specific date
export const getAvailableSlotsByDate = async (
  dateStr: string
): Promise<AvailabilityResult | null> => {
  try {
    console.log(`🔍 Fetching availability for ${dateStr}`);

    // Get all treatments to find the minimum duration
    const treatments = await getTreatments();
    const minTreatmentDuration = treatments.reduce((min, treatment) => {
      const treatmentMinDuration = treatment.durations.reduce((minDur, dur) => {
        return dur.duration < minDur ? dur.duration : minDur;
      }, Infinity);
      return treatmentMinDuration < min ? treatmentMinDuration : min;
    }, 30); // Default to 30 min if no treatments found

    console.log(
      `Minimum treatment duration across all treatments: ${minTreatmentDuration} minutes`
    );

    let workHours: WorkHours | null = null;
    let eventDetails: EventDetails | null = null;

    // Calculate Norwegian day boundaries
    const { startOfDay, endOfDay } = getOsloDayBounds(dateStr);
    console.log(`Oslo startOfDay (UTC): ${startOfDay.toISOString()}`);
    console.log(`Oslo endOfDay (UTC): ${endOfDay.toISOString()}`);
    console.log(`Oslo startOfDay (local): ${startOfDay.toString()}`);
    console.log(`Oslo endOfDay (local): ${endOfDay.toString()}`);

    // STEP 1: Check for an override on this day.
    console.log(`🔎 Checking for overrides for ${dateStr}`);
    const overrideQuery = query(
      collection(db, "availibilityOverrides"),
      where("date", ">=", Timestamp.fromDate(startOfDay)),
      where("date", "<", Timestamp.fromDate(endOfDay))
    );
    const overrideSnapshot = await getDocs(overrideQuery);
    console.log(
      `Override query returned ${overrideSnapshot.size} document(s).`
    );

    if (!overrideSnapshot.empty) {
      console.log(`✅ Override found for ${dateStr}`);
      const overrideData = overrideSnapshot.docs[0].data() as OverrideData;
      console.log("Override document data:", overrideData);
      workHours = overrideData.workhours;

      if (overrideData.eventId) {
        const eventRef = doc(db, "events", overrideData.eventId);
        const eventDoc = await getDoc(eventRef);
        if (eventDoc.exists()) {
          eventDetails = eventDoc.data() as EventDetails;
        }
      }
    } else {
      console.log("No override found. Falling back to default schedule.");
      const englishDay = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "Europe/Oslo",
      }).format(startOfDay);
      const dayKey = englishDay.toLowerCase();
      const defaultRef = doc(db, "defaultAvailability", "default_workhours");
      const defaultDoc = await getDoc(defaultRef);
      if (!defaultDoc.exists()) {
        console.warn("⚠️ No default schedule found.");
        return null;
      }
      const defaultData = defaultDoc.data() as DefaultAvailability;
      if (defaultData.weeklySchedule[dayKey]) {
        workHours = defaultData.weeklySchedule[dayKey].workhours;
      } else {
        console.warn(`⚠️ No default work hours found for ${dayKey}`);
        return null;
      }
    }

    // Special handling for empty or missing work hours
    if (!workHours) {
      console.log(`⚠️ No work hours found for ${dateStr}`);
      return null;
    }

    // Handle empty timeslots array case (weekends or days off)
    if (!workHours.timeSlots || workHours.timeSlots.length === 0) {
      console.log(
        `⚠️ No time slots available for ${dateStr} (day off or weekend)`
      );
      return {
        availabilityByLocation: [],
        eventDetails,
      };
    }

    console.log(`✅ Work hours for ${dateStr}:`, workHours);

    // STEP 2: Fetch booked slots for this day.
    const bookingsRef = collection(db, "bookings");

    // Log the exact query parameters
    console.log(
      `Querying bookings with date field: date >= ${startOfDay.toISOString()} AND date < ${endOfDay.toISOString()}`
    );

    const bookingsQueryRef = query(
      bookingsRef,
      where("date", ">=", Timestamp.fromDate(startOfDay)),
      where("date", "<", Timestamp.fromDate(endOfDay))
    );

    const bookingsSnapshot = await getDocs(bookingsQueryRef);
    console.log(
      `Bookings query returned ${bookingsSnapshot.size} document(s).`
    );

    // Alternative approach: get all bookings and filter manually
    const allBookingsSnapshot = await getDocs(collection(db, "bookings"));

    // Manually filter for the target date and log results
    const manuallyFilteredBookings = allBookingsSnapshot.docs.filter((doc) => {
      const data = doc.data();
      const bookingDate = data.date?.toDate?.();
      if (!bookingDate) return false;

      const bookingDateStr = bookingDate.toISOString().split("T")[0]; // YYYY-MM-DD
      const targetDateStr = dateStr; // YYYY-MM-DD

      console.log(
        `Comparing booking date: ${bookingDateStr} with target: ${targetDateStr} for ID: ${doc.id}`
      );

      return bookingDateStr === targetDateStr;
    });

    console.log(
      `Manually filtered found ${manuallyFilteredBookings.length} bookings for ${dateStr}`
    );
    if (manuallyFilteredBookings.length > 0) {
      console.log(
        "Manually found bookings:",
        manuallyFilteredBookings.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date?.toDate?.()?.toISOString(),
            timeSlot: {
              start: data.timeslot?.start?.toDate?.()?.toISOString(),
              end: data.timeslot?.end?.toDate?.()?.toISOString(),
            },
            status: data.status,
          };
        })
      );
    }

    // Also check with just the timeslot
    // Try timeslot-based query approach
    const timeslotBasedSnapshot = await getDocs(
      query(
        bookingsRef,
        where("timeslot.start", ">=", Timestamp.fromDate(startOfDay)),
        where("timeslot.start", "<", Timestamp.fromDate(endOfDay))
      )
    );
    console.log(
      `Timeslot-based query found ${timeslotBasedSnapshot.size} bookings`
    );
    if (timeslotBasedSnapshot.size > 0) {
      console.log(
        "Timeslot-based bookings:",
        timeslotBasedSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date?.toDate?.()?.toISOString(),
            timeSlot: {
              start: data.timeslot?.start?.toDate?.()?.toISOString(),
              end: data.timeslot?.end?.toDate?.()?.toISOString(),
            },
            status: data.status,
          };
        })
      );
    }

    // Define a travel buffer in minutes (e.g. 15 minutes)
    const travelBuffer = 15;

    // Store full booking time ranges instead of just individual time slots
    const bookedRanges: { start: Date; end: Date }[] = [];

    // Count bookings by status for debugging
    let activeBookings = 0;
    let cancelledBookings = 0;

    // Debug bookings found
    console.log(
      `🔍 Examining ${bookingsSnapshot.size} bookings for ${dateStr}`
    );

    // Process bookings from the main query
    bookingsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`Booking ID: ${doc.id}, Data:`, data);

      // Skip cancelled bookings
      if (data.status === "cancelled") {
        console.log(`Skipping cancelled booking ${doc.id}`);
        cancelledBookings++;
        return;
      }

      const timeslot = data.timeslot;
      if (timeslot && timeslot.start && timeslot.end) {
        try {
          // Convert Firestore timestamps to JS Date objects
          const startTime = timeslot.start.toDate
            ? timeslot.start.toDate()
            : new Date(timeslot.start);
          const endTime = timeslot.end.toDate
            ? timeslot.end.toDate()
            : new Date(timeslot.end);

          console.log(
            `Booking: ${startTime.toTimeString()} - ${endTime.toTimeString()}`
          );
          console.log(
            `Duration: ${Math.round((endTime - startTime) / 60000)} minutes`
          );

          // Add travel buffer to end time
          const endTimeWithBuffer = new Date(
            endTime.getTime() + travelBuffer * 60000
          );

          // Add the booking time range
          bookedRanges.push({
            start: startTime,
            end: endTimeWithBuffer,
          });

          console.log(
            `Added booking range: ${startTime.toTimeString()} - ${endTimeWithBuffer.toTimeString()} (with ${travelBuffer}min buffer)`
          );
          activeBookings++;
        } catch (e) {
          console.error(`Error processing booking timeslot:`, e);
        }
      } else {
        console.warn(`Booking ${doc.id} has invalid timeslot data:`, timeslot);
      }
    });

    // Process bookings from timeslot-based query if they weren't found by the main query
    timeslotBasedSnapshot.docs.forEach((doc) => {
      // Skip if already processed
      if (bookingsSnapshot.docs.some((existing) => existing.id === doc.id)) {
        return;
      }

      const data = doc.data();
      console.log(`Adding timeslot-based booking ID: ${doc.id}, Data:`, data);

      // Skip cancelled bookings
      if (data.status === "cancelled") {
        console.log(`Skipping cancelled timeslot-based booking ${doc.id}`);
        cancelledBookings++;
        return;
      }

      const timeslot = data.timeslot;
      if (timeslot && timeslot.start && timeslot.end) {
        try {
          // Convert Firestore timestamps to JS Date objects
          const startTime = timeslot.start.toDate
            ? timeslot.start.toDate()
            : new Date(timeslot.start);
          const endTime = timeslot.end.toDate
            ? timeslot.end.toDate()
            : new Date(timeslot.end);

          console.log(
            `Timeslot Booking: ${startTime.toTimeString()} - ${endTime.toTimeString()}`
          );
          console.log(
            `Duration: ${Math.round((endTime - startTime) / 60000)} minutes`
          );

          // Add travel buffer to end time
          const endTimeWithBuffer = new Date(
            endTime.getTime() + travelBuffer * 60000
          );

          // Add the booking time range
          bookedRanges.push({
            start: startTime,
            end: endTimeWithBuffer,
          });

          console.log(
            `Added timeslot booking range: ${startTime.toTimeString()} - ${endTimeWithBuffer.toTimeString()} (with ${travelBuffer}min buffer)`
          );
          activeBookings++;
        } catch (e) {
          console.error(`Error processing timeslot booking:`, e);
        }
      }
    });

    // Also include bookings found through manual filtering if they weren't already found
    if (manuallyFilteredBookings.length > 0) {
      manuallyFilteredBookings.forEach((doc) => {
        // Skip if this booking was already processed
        if (
          bookingsSnapshot.docs.some((existing) => existing.id === doc.id) ||
          timeslotBasedSnapshot.docs.some((existing) => existing.id === doc.id)
        ) {
          console.log(`Skipping already processed booking: ${doc.id}`);
          return;
        }

        const data = doc.data();
        console.log(`Adding manually found booking ID: ${doc.id}, Data:`, data);

        // Skip cancelled bookings
        if (data.status === "cancelled") {
          console.log(`Skipping cancelled manually found booking ${doc.id}`);
          cancelledBookings++;
          return;
        }

        const timeslot = data.timeslot;
        if (timeslot && timeslot.start && timeslot.end) {
          try {
            // Convert Firestore timestamps to JS Date objects
            const startTime = timeslot.start.toDate
              ? timeslot.start.toDate()
              : new Date(timeslot.start);
            const endTime = timeslot.end.toDate
              ? timeslot.end.toDate()
              : new Date(timeslot.end);

            console.log(
              `Manual Booking: ${startTime.toTimeString()} - ${endTime.toTimeString()}`
            );
            console.log(
              `Duration: ${Math.round((endTime - startTime) / 60000)} minutes`
            );

            // Add travel buffer to end time
            const endTimeWithBuffer = new Date(
              endTime.getTime() + travelBuffer * 60000
            );

            // Add the booking time range
            bookedRanges.push({
              start: startTime,
              end: endTimeWithBuffer,
            });

            console.log(
              `Added manual booking range: ${startTime.toTimeString()} - ${endTimeWithBuffer.toTimeString()} (with ${travelBuffer}min buffer)`
            );
            activeBookings++;
          } catch (e) {
            console.error(`Error processing manual booking timeslot:`, e);
          }
        } else {
          console.warn(
            `Manual booking ${doc.id} has invalid timeslot data:`,
            timeslot
          );
        }
      });
    }

    console.log(
      `Booked ranges for ${dateStr}:`,
      bookedRanges.map(
        (r) =>
          `${r.start.toTimeString().substring(0, 5)} - ${r.end
            .toTimeString()
            .substring(0, 5)}`
      )
    );

    // Log booking statistics
    console.log(
      `Booking statistics for ${dateStr}: ${activeBookings} active, ${cancelledBookings} cancelled`
    );

    // STEP 3: Generate available slots for each work hour time slot
    const availabilityByLocation = workHours.timeSlots
      .filter((timeSlot) => {
        // Filter out slots with empty or missing start/end times
        const start = timeSlot.start;
        const end = timeSlot.end;
        return (
          start &&
          end &&
          (typeof start === "string" ? start !== "" : true) &&
          (typeof end === "string" ? end !== "" : true) &&
          typeof start !== "undefined" &&
          typeof end !== "undefined"
        );
      })
      .map((timeSlot) => {
        // Convert string to Date object if necessary
        let startTime =
          typeof timeSlot.start === "string"
            ? timeSlot.start
            : (timeSlot.start as unknown as Date).toTimeString?.()
            ? (timeSlot.start as unknown as Date).toTimeString().substring(0, 5)
            : "";

        let endTime =
          typeof timeSlot.end === "string"
            ? timeSlot.end
            : (timeSlot.end as unknown as Date).toTimeString?.()
            ? (timeSlot.end as unknown as Date).toTimeString().substring(0, 5)
            : "";

        // Log what we've extracted to debug the issue
        console.log(
          `Time slot processing for location ${JSON.stringify(
            timeSlot.location
          )}:`
        );
        console.log(`- Original start: ${JSON.stringify(timeSlot.start)}`);
        console.log(`- Original end: ${JSON.stringify(timeSlot.end)}`);
        console.log(`- Extracted startTime: "${startTime}"`);
        console.log(`- Extracted endTime: "${endTime}"`);

        // Try to extract time from date objects using a safer approach
        if (startTime === "" && timeSlot.start) {
          try {
            const start = timeSlot.start as unknown as {
              getHours?: () => number;
              getMinutes?: () => number;
            };
            if (
              typeof start.getHours === "function" &&
              typeof start.getMinutes === "function"
            ) {
              const hours = start.getHours().toString().padStart(2, "0");
              const minutes = start.getMinutes().toString().padStart(2, "0");
              startTime = `${hours}:${minutes}`;
              console.log(
                `- Extracted startTime from getHours/getMinutes: "${startTime}"`
              );
            }
          } catch (err) {
            console.error("Error extracting startTime:", err);
          }
        }

        if (endTime === "" && timeSlot.end) {
          try {
            const end = timeSlot.end as unknown as {
              getHours?: () => number;
              getMinutes?: () => number;
            };
            if (
              typeof end.getHours === "function" &&
              typeof end.getMinutes === "function"
            ) {
              const hours = end.getHours().toString().padStart(2, "0");
              const minutes = end.getMinutes().toString().padStart(2, "0");
              endTime = `${hours}:${minutes}`;
              console.log(
                `- Extracted endTime from getHours/getMinutes: "${endTime}"`
              );
            }
          } catch (err) {
            console.error("Error extracting endTime:", err);
          }
        }

        // If we still have empty times after all extraction attempts, use default values for debugging
        if (startTime === "") {
          console.log("Still failed to extract start time, using default");
          startTime = "09:00"; // Use 9 AM as default
        }

        if (endTime === "") {
          console.log("Still failed to extract end time, using default");
          endTime = "17:00"; // Use 5 PM as default
        }

        // Function to properly create a Time Date from a string like "08:30"
        const createTimeDate = (timeStr: string): Date => {
          if (!timeStr || timeStr === "") {
            console.log("Empty time string provided to createTimeDate");
            return new Date(0); // Default to epoch time
          }

          // Debug the input time string
          console.log(`Creating time date from: "${timeStr}"`);

          try {
            // Parse the time string in 24-hour format (HH:MM)
            const [hours, minutes] = timeStr.split(":").map(Number);

            // Create ISO string in UTC for a specific date (January 1, 2023)
            // We use a fixed date that's not epoch to avoid timezone issues
            const isoString = `2023-01-01T${hours
              .toString()
              .padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:00.000Z`;
            const date = new Date(isoString);

            console.log(`Created date: ${date.toISOString()} from ${timeStr}`);
            return date;
          } catch (err) {
            console.error(`Error creating date from ${timeStr}:`, err);
            return new Date("2023-01-01T12:00:00.000Z"); // Default to noon
          }
        };

        if (!startTime || !endTime || startTime === "" || endTime === "") {
          console.log("Empty time slot detected:", { startTime, endTime });
          return {
            location:
              typeof timeSlot.location === "string"
                ? timeSlot.location
                : timeSlot.location.name,
            availableSlots: [],
            workHours: {
              location:
                typeof timeSlot.location === "string"
                  ? timeSlot.location
                  : timeSlot.location.name,
              // Create proper Date objects for TypeScript compatibility
              start: createTimeDate(startTime || "00:00"),
              end: createTimeDate(endTime || "00:00"),
              // Add string properties that will be used by the UI
              startString: startTime || "00:00",
              endString: endTime || "00:00",
            },
          };
        }

        console.log(`Valid time slot: ${startTime}-${endTime}`);

        const availableSlots = generateTimeSlots(
          startTime,
          endTime,
          bookedRanges,
          15, // increment of 15 minutes
          minTreatmentDuration // Use minimum treatment duration for availability calculation
        );

        return {
          location:
            typeof timeSlot.location === "string"
              ? timeSlot.location
              : timeSlot.location.name,
          availableSlots,
          workHours: {
            location:
              typeof timeSlot.location === "string"
                ? timeSlot.location
                : timeSlot.location.name,
            // Create proper Date objects for TypeScript compatibility
            start: createTimeDate(startTime),
            end: createTimeDate(endTime),
            // Add string properties that will be used by the UI
            startString: startTime,
            endString: endTime,
          },
        };
      })
      .filter((slot) => slot.availableSlots.length > 0);

    console.log(
      `Final availability by location:`,
      availabilityByLocation.map(
        (loc) => `Location: ${loc.availableSlots.length} available slots`
      )
    );

    return {
      availabilityByLocation,
      eventDetails,
    };
  } catch (error) {
    console.error("❌ Error fetching available slots:", error);
    throw error;
  }
};

/**
 * Sets the default weekly schedule for work hours
 */
export async function setDefaultWorkHours(
  weeklySchedule: WeeklySchedule
): Promise<void> {
  try {
    const defaultRef = doc(db, "defaultAvailability", "default_workhours");
    await setDoc(defaultRef, { weeklySchedule }, { merge: true });
    console.log("✅ Default work hours updated successfully");
  } catch (error) {
    console.error("❌ Error setting default work hours:", error);
    throw error;
  }
}

/**
 * Retrieves the default weekly workhour schedule from Firebase
 */
export async function getDefaultWorkHours(): Promise<WeeklySchedule | null> {
  try {
    const defaultRef = doc(db, "defaultAvailability", "default_workhours");
    const defaultDoc = await getDoc(defaultRef);

    if (!defaultDoc.exists()) {
      console.warn("⚠️ No default work hours found");
      return null;
    }

    const data = defaultDoc.data() as DefaultAvailability;
    return data.weeklySchedule;
  } catch (error) {
    console.error("❌ Error getting default work hours:", error);
    throw error;
  }
}

/**
 * Creates an override for a specific date
 */
export async function createWorkHoursOverride(
  date: Date,
  workhours: WorkHours,
  location: string,
  eventId?: string
): Promise<string> {
  try {
    const override = {
      date: Timestamp.fromDate(date),
      workhours,
      location,
      ...(eventId && { eventId }),
    };

    const docRef = await addDoc(
      collection(db, "availibilityOverrides"),
      override
    );
    console.log("✅ Work hours override created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error creating work hours override:", error);
    throw error;
  }
}

/**
 * Gets all overrides for a date range
 */
export async function getWorkHoursOverrides(
  startDate: Date,
  endDate: Date
): Promise<(OverrideData & { id: string; date: Date })[]> {
  try {
    const overridesQuery = query(
      collection(db, "availibilityOverrides"),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getDocs(overridesQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: (doc.data().date as Timestamp).toDate(),
    })) as (OverrideData & { id: string; date: Date })[];
  } catch (error) {
    console.error("❌ Error getting work hours overrides:", error);
    throw error;
  }
}

/**
 * Deletes a specific override by ID
 */
export async function deleteWorkHoursOverride(
  overrideId: string
): Promise<void> {
  try {
    const overrideRef = doc(db, "availibilityOverrides", overrideId);
    await deleteDoc(overrideRef);
    console.log("✅ Work hours override deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting work hours override:", error);
    throw error;
  }
}

/**
 * Retrieves the override work hours for a specific date
 */
export async function getOverrideWorkHours(
  date: string
): Promise<OverrideData | null> {
  try {
    const { startOfDay, endOfDay } = getOsloDayBounds(date);
    const overrideQuery = query(
      collection(db, "availibilityOverrides"),
      where("date", ">=", Timestamp.fromDate(startOfDay)),
      where("date", "<", Timestamp.fromDate(endOfDay))
    );
    const overrideSnapshot = await getDocs(overrideQuery);

    if (!overrideSnapshot.empty) {
      const overrideData = overrideSnapshot.docs[0].data() as OverrideData;
      return overrideData;
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching override work hours:", error);
    throw error;
  }
}

/**
 * Sets the override work hours for a specific date
 */
export async function setOverrideWorkHours(
  date: string,
  overrideData: OverrideData
): Promise<void> {
  try {
    const { startOfDay } = getOsloDayBounds(date);
    const overrideRef = doc(collection(db, "availibilityOverrides"), date);
    await setDoc(
      overrideRef,
      {
        ...overrideData,
        date: Timestamp.fromDate(startOfDay),
      },
      { merge: true }
    );
    console.log("✅ Override work hours set successfully for", date);
  } catch (error) {
    console.error("❌ Error setting override work hours:", error);
    throw error;
  }
}
