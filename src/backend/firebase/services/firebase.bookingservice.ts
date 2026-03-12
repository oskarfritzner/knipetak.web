import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import app from "../firebase";
import BookingData from "../../interfaces/BookingData";

const db = getFirestore(app);

export interface BookingTimeslot {
  start: Date | Timestamp;
  end: Date | Timestamp;
}

/**
 * Booking interface representing the structure of a booking document.
 */
export interface Booking {
  createdAt: Timestamp; // Automatically set by Firestore
  customerId: string; // "Hentes fra innlogget brukers kunde"
  date: Date | Timestamp; // The date of the booking (appointment)
  duration: number; // Duration in minutes (e.g. 60)
  location: string; // E.g. "Haukeland"
  paymentStatus: string; // E.g. "paid"
  price: number; // E.g. 1550
  status: string; // E.g. "pending"
  timeslot: BookingTimeslot; // Start and end times as timestamps
  treatmentId: string;
}

/**
 * Creates a new booking in the Firestore "bookings" collection.
 * The `bookingData` parameter should include all properties defined in BookingData.
 * The `createdAt` field will be automatically set to Firestore's server timestamp.
 */
export const createBooking = async (
  bookingData: BookingData,
): Promise<string> => {
  try {
    console.log("📝 Creating new booking with details:", {
      date: bookingData.date.toISOString(),
      timeslot: {
        start: bookingData.timeslot.start.toTimeString(),
        end: bookingData.timeslot.end.toTimeString(),
      },
      duration: bookingData.duration,
      treatmentId: bookingData.treatmentId,
    });

    // Convert JS Date objects to Firestore Timestamps to ensure consistency
    const bookingWithTimestamp = {
      ...bookingData,
      createdAt: serverTimestamp(),
      // Ensure timeslot dates are handled correctly
      timeslot: {
        start: Timestamp.fromDate(bookingData.timeslot.start),
        end: Timestamp.fromDate(bookingData.timeslot.end),
      },
    };

    const docRef = await addDoc(
      collection(db, "bookings"),
      bookingWithTimestamp,
    );
    console.log("✅ Booking created successfully with ID:", docRef.id);
    console.log(
      `📅 Booking timeslot: ${bookingData.timeslot.start.toTimeString()} - ${bookingData.timeslot.end.toTimeString()}`,
    );
    console.log(`⏱️ Duration: ${bookingData.duration} minutes`);
    return docRef.id;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

/**
 * Fetches all bookings for a specific user from Firestore
 */
export const getUserBookings = async (
  userId: string,
): Promise<BookingData[]> => {
  try {
    console.log("Fetching bookings for user:", userId);
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("customerId", "==", userId));

    console.log("Executing Firestore query...");
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} bookings`);

    const bookings: BookingData[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Raw booking data:", data);

      try {
        // Convert Firestore Timestamps to Dates
        const booking: BookingData = {
          ...data,
          date: data.date?.toDate?.() || new Date(),
          timeslot: {
            start: data.timeslot?.start?.toDate?.() || new Date(),
            end: data.timeslot?.end?.toDate?.() || new Date(),
          },
        } as BookingData;
        console.log("Processed booking:", booking);
        bookings.push(booking);
      } catch (error) {
        console.error("Error processing booking:", error, "Raw data:", data);
      }
    });

    // Sort bookings by date manually
    bookings.sort((a, b) => b.date.getTime() - a.date.getTime());

    console.log("Final bookings array:", bookings);
    return bookings;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};

/**
 * Fetches all bookings from Firestore
 */
export const getAllBookings = async (): Promise<BookingData[]> => {
  try {
    console.log("Fetching all bookings");
    const bookingsRef = collection(db, "bookings");
    const querySnapshot = await getDocs(bookingsRef);
    console.log(`Found ${querySnapshot.size} bookings`);

    const bookings: BookingData[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Raw booking data:", data);

      try {
        // Convert Firestore Timestamps to Dates
        const booking: BookingData = {
          bookingId: doc.id,
          customerId: data.customerId || "",
          customerEmail: data.customerEmail || "",
          customerName: data.customerName || "",
          customerPhone: data.customerPhone || "",
          date: data.date?.toDate?.() || new Date(),
          duration: data.duration || 0,
          location: data.location || { address: "", city: "", postalCode: 0 },
          paymentStatus: data.paymentStatus || "pending",
          price: data.price || 0,
          status: data.status || "pending",
          customerMessage: data.customerMessage || "",
          timeslot: {
            start: data.timeslot?.start?.toDate?.() || new Date(),
            end: data.timeslot?.end?.toDate?.() || new Date(),
          },
          treatmentId: data.treatmentId || "",
          isGuestBooking: data.isGuestBooking || false,
        };
        console.log("Processed booking:", booking);
        bookings.push(booking);
      } catch (error) {
        console.error("Error processing booking:", error, "Raw data:", data);
      }
    });

    // Sort bookings by date manually
    bookings.sort((a, b) => b.date.getTime() - a.date.getTime());

    console.log("Final bookings array:", bookings);
    return bookings;
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    throw error;
  }
};

/**
 * Oppdaterer en eksisterende booking i Firestore
 */
export const updateBooking = async (
  bookingId: string,
  updateData: Partial<BookingData>,
): Promise<void> => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, updateData);
    console.log("Booking oppdatert med ID:", bookingId);
  } catch (error) {
    console.error("Feil ved oppdatering av booking:", error);
    throw error;
  }
};

/**
 * Kansellerer en booking ved å endre status til "cancelled"
 */
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, { status: "cancelled" });
    console.log("Booking kansellert med ID:", bookingId);
  } catch (error) {
    console.error("Feil ved kansellering av booking:", error);
    throw error;
  }
};
