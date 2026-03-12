import { useState, useMemo, useCallback } from "react";
import { TimeSlotUI } from "@/utils/TimeSlotUtils";
import type { Location } from "@/backend/interfaces/Location";

/**
 * Base hook for managing a flat array of time slots
 */
export function useTimeSlotsArray(
  initialSlots: TimeSlotUI[] = [],
  options?: {
    onUpdate?: () => void;
    defaultLocation?: string;
  },
) {
  const [timeSlots, setTimeSlots] = useState<TimeSlotUI[]>(initialSlots);

  const defaultSlot: TimeSlotUI = useMemo(
    () => ({
      start: "09:00",
      end: "17:00",
      location: options?.defaultLocation || "",
    }),
    [options?.defaultLocation],
  );

  // Create memoized callbacks for operations to prevent unnecessary rerenders
  const add = useCallback(
    (customSlot?: Partial<TimeSlotUI>) => {
      setTimeSlots((prev) => [
        ...prev,
        {
          ...defaultSlot,
          ...customSlot,
        },
      ]);
      options?.onUpdate?.();
    },
    [defaultSlot, options?.onUpdate],
  );

  const remove = useCallback(
    (index: number) => {
      setTimeSlots((prev) => prev.filter((_, i) => i !== index));
      options?.onUpdate?.();
    },
    [options?.onUpdate],
  );

  const update = useCallback(
    (index: number, field: keyof TimeSlotUI, value: string) => {
      setTimeSlots((prev) =>
        prev.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot,
        ),
      );
      options?.onUpdate?.();
    },
    [options?.onUpdate],
  );

  const replace = useCallback(
    (newSlots: TimeSlotUI[]) => {
      setTimeSlots(newSlots);
      options?.onUpdate?.();
    },
    [options?.onUpdate],
  );

  const clear = useCallback(() => {
    setTimeSlots([]);
    options?.onUpdate?.();
  }, [options?.onUpdate]);

  // Return both state and operations
  return {
    timeSlots,
    setTimeSlots,
    operations: {
      add,
      remove,
      update,
      replace,
      clear,
    },
  };
}

/**
 * Interface for the weekly schedule structure
 */
export interface DaySchedule {
  timeSlots: TimeSlotUI[];
}

export interface WeeklyScheduleUI {
  [day: string]: {
    workhours: DaySchedule;
  };
}

export type DayMapping = Record<string, string>;

/**
 * Hook for managing a weekly schedule with time slots
 */
export function useWeeklyTimeSlots(
  initialSchedule: WeeklyScheduleUI,
  options?: {
    dayMapping?: DayMapping;
    onUpdate?: () => void;
    defaultLocation?: string;
  },
) {
  const [schedule, setSchedule] = useState<WeeklyScheduleUI>(initialSchedule);

  const defaultSlot: TimeSlotUI = useMemo(
    () => ({
      start: "09:00",
      end: "17:00",
      location: options?.defaultLocation || "",
    }),
    [options?.defaultLocation],
  );

  // Helper to map display day (e.g. Norwegian) to storage day (e.g. English)
  const getDayKey = useCallback(
    (day: string): string => {
      return options?.dayMapping?.[day] || day;
    },
    [options?.dayMapping],
  );

  // Create memoized callbacks for operations
  const addTimeSlot = useCallback(
    (day: string, customSlot?: Partial<TimeSlotUI>) => {
      const dayKey = getDayKey(day);

      setSchedule((prev) => {
        // Handle the case where this day might not exist yet
        if (!prev[dayKey]) {
          return {
            ...prev,
            [dayKey]: {
              workhours: {
                timeSlots: [
                  {
                    ...defaultSlot,
                    ...customSlot,
                  },
                ],
              },
            },
          };
        }

        return {
          ...prev,
          [dayKey]: {
            ...prev[dayKey],
            workhours: {
              timeSlots: [
                ...prev[dayKey].workhours.timeSlots,
                {
                  ...defaultSlot,
                  ...customSlot,
                },
              ],
            },
          },
        };
      });

      options?.onUpdate?.();
    },
    [getDayKey, defaultSlot, options?.onUpdate],
  );

  const removeTimeSlot = useCallback(
    (day: string, index: number) => {
      const dayKey = getDayKey(day);

      setSchedule((prev) => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          workhours: {
            timeSlots: prev[dayKey].workhours.timeSlots.filter(
              (_, i) => i !== index,
            ),
          },
        },
      }));

      options?.onUpdate?.();
    },
    [getDayKey, options?.onUpdate],
  );

  const updateTimeSlot = useCallback(
    (day: string, index: number, field: keyof TimeSlotUI, value: string) => {
      const dayKey = getDayKey(day);

      setSchedule((prev) => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          workhours: {
            timeSlots: prev[dayKey].workhours.timeSlots.map((slot, i) =>
              i === index ? { ...slot, [field]: value } : slot,
            ),
          },
        },
      }));

      options?.onUpdate?.();
    },
    [getDayKey, options?.onUpdate],
  );

  const toggleDayOff = useCallback(
    (day: string, isDayOff: boolean, defaultLocationId?: string) => {
      const dayKey = getDayKey(day);

      setSchedule((prev) => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          workhours: {
            timeSlots: isDayOff
              ? []
              : [
                  {
                    ...defaultSlot,
                    location: defaultLocationId || defaultSlot.location,
                  },
                ],
          },
        },
      }));

      options?.onUpdate?.();
    },
    [getDayKey, defaultSlot, options?.onUpdate],
  );

  // Return both state and operations
  return {
    schedule,
    setSchedule,
    operations: {
      addTimeSlot,
      removeTimeSlot,
      updateTimeSlot,
      toggleDayOff,
    },
  };
}

/**
 * Utility hook for working with locations
 */
export function useDefaultLocation(locations: Location[]) {
  return useMemo(() => locations[0]?.id || "", [locations]);
}
