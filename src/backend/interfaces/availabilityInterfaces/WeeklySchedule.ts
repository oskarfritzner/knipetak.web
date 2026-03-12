import WorkHours from "./WorkHours";

// A list of work hours for each weekday

export default interface WeeklySchedule {
  [day: string]: {
    workhours: WorkHours;
  };
}
