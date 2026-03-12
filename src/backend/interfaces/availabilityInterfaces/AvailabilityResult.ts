import EventDetails from "./EventDetails";
import { TimeSlot } from "@/backend/interfaces/timeSlot";

// This is what we return when asking for available time slots on a specific day

interface LocationAvailability {
  location: string;
  availableSlots: string[];
  workHours: TimeSlot;
}

export default interface AvailabilityResult {
  availabilityByLocation: LocationAvailability[];
  eventDetails: EventDetails | null;
}
