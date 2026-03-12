import { CustomerLocation } from "./Location"; // Importing the Location interface from UserData.ts

export interface BookingData {
  bookingId?: string; // ID of the booking document
  customerId: string; // ID of the user making the booking
  customerEmail: string; // Email of the customer (required for guest bookings)
  customerName: string; // Name of the customer (required for guest bookings)
  customerPhone: string; // Phone number (required for guest bookings)
  date: Date; // Appointment date
  duration: number; // Total booking duration (in minutes)
  location: CustomerLocation; // Contains "address", "city", "postalCode"
  paymentStatus: false; // e.g. "pending" or "paid"
  price: number; // e.g. 1550
  status: string; // e.g. "pending"
  customerMessage: string;
  timeslot: {
    start: Date;
    end: Date;
  };
  treatmentId: string; // e.g. "deep_tissue"
  isGuestBooking: boolean; // Whether this is a guest booking
}

export default BookingData;
