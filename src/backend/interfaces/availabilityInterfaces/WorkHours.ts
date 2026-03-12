/**
 * Interface representing work hours for a location or day
 */
interface WorkHours {
  timeSlots: {
    location: string | { id: string; name: string };
    start: string;
    end: string;
  }[];
}

export default WorkHours;
