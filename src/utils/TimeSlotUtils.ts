// New file: src/backend/utils/timeSlotUtils.ts
import { format, parse } from "date-fns";
import { Timestamp } from "firebase/firestore";
import type { TimeSlot } from "@/backend/interfaces/timeSlot";
import type WorkHours from "@/backend/interfaces/availabilityInterfaces/WorkHours";

// UI representation with string times
export interface TimeSlotUI {
  start: string; // "HH:MM" format
  end: string; // "HH:MM" format
  location: string; // Location ID
}

// For Firebase with Timestamp support
export interface TimeSlotFirebase {
  start: Timestamp | Date;
  end: Timestamp | Date;
  location: string;
}

// Conversion utilities
export const timeSlotToUI = (timeSlot: TimeSlot): TimeSlotUI => ({
  start: format(timeSlot.start, "HH:mm"),
  end: format(timeSlot.end, "HH:mm"),
  location: timeSlot.location || "",
});

export const uiToTimeSlot = (ui: TimeSlotUI, dateStr: string): TimeSlot => ({
  start: parse(`${dateStr} ${ui.start}`, "yyyy-MM-dd HH:mm", new Date()),
  end: parse(`${dateStr} ${ui.end}`, "yyyy-MM-dd HH:mm", new Date()),
  location: ui.location,
});

// Convert between WorkHours format and TimeSlot
export const workHoursToTimeSlots = (
  workHours: WorkHours,
  dateStr: string,
): TimeSlot[] => {
  return workHours.timeSlots.map((slot) => ({
    start:
      typeof slot.start === "string"
        ? parse(`${dateStr} ${slot.start}`, "yyyy-MM-dd HH:mm", new Date())
        : new Date(slot.start),
    end:
      typeof slot.end === "string"
        ? parse(`${dateStr} ${slot.end}`, "yyyy-MM-dd HH:mm", new Date())
        : new Date(slot.end),
    location:
      typeof slot.location === "string" ? slot.location : slot.location.id,
  }));
};

export const timeSlotsToWorkHours = (timeSlots: TimeSlot[]): WorkHours => {
  return {
    timeSlots: timeSlots.map((slot) => ({
      start: format(slot.start, "HH:mm"),
      end: format(slot.end, "HH:mm"),
      location: slot.location,
    })),
  };
};

// Convert from Firebase format to TimeSlot
export const firebaseToTimeSlot = (firebase: TimeSlotFirebase): TimeSlot => ({
  start:
    firebase.start instanceof Timestamp
      ? firebase.start.toDate()
      : firebase.start,
  end: firebase.end instanceof Timestamp ? firebase.end.toDate() : firebase.end,
  location: firebase.location,
});

// Convert from TimeSlot to Firebase format
export const timeSlotToFirebase = (timeSlot: TimeSlot): TimeSlotFirebase => ({
  start: timeSlot.start,
  end: timeSlot.end,
  location: timeSlot.location || "",
});
