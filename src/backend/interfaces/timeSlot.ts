// src/backend/interfaces/TimeSlot.ts - Base interface
export interface TimeSlot {
  start: Date;
  end: Date;
  location: string; // Just the ID
}
