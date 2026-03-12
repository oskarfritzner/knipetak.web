import WorkHours from "./WorkHours";

// A special override to replace the normal schedule on a specific day

export default interface OverrideData {
  workhours: WorkHours;
  location: string;
  eventId?: string;
}
