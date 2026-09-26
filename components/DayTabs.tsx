"use client";

import { Day } from "@/types/itinerary";

interface DayTabsProps {
  days: Day[];
  activeDayIndex: number;
  onDayChange: (index: number) => void;
}

export default function DayTabs({ days, activeDayIndex, onDayChange }: DayTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
      {days.map((day, i) => {
        const isActive = i === activeDayIndex;
        const stopCount = day.stops.length;

        return (
          <button
            key={day.day}
            id={`day-tab-${day.day}`}
            onClick={() => onDayChange(i)}
            className={`day-tab flex-shrink-0 ${isActive ? "day-tab-active" : ""}`}
          >
            <span style={{ fontSize: 13, fontWeight: 600, display: "block", lineHeight: 1.2 }}>
              Day {day.day}
            </span>
            <span style={{
              fontSize: 11,
              display: "block",
              lineHeight: 1.3,
              marginTop: 2,
              color: isActive ? "rgba(196,181,253,0.7)" : "var(--text-muted)",
            }}>
              {stopCount} stop{stopCount !== 1 ? "s" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
