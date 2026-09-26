"use client";

import { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Stop } from "@/types/itinerary";
import { categoryConfig, timeOfDayConfig, statusConfig, formatDuration } from "@/lib/utils";

interface StopCardProps {
  stop: Stop;
  index: number;
  dayIndex: number;
  onRemove: (stopId: string) => void;
  onKeep: (stopId: string) => void;
  isActive?: boolean;
  onFocus?: (stopId: string) => void;
}

export default function StopCard({
  stop,
  index,
  dayIndex,
  onRemove,
  onKeep,
  isActive,
  onFocus,
}: StopCardProps) {
  const [expanded, setExpanded] = useState(false);
  // Auto-expand when map pin is clicked (isActive becomes true)
  useEffect(() => {
    if (isActive) {
      setExpanded(true);
      // Auto-scroll into view if it was activated from outside (like a map click)
      const el = document.getElementById(`stop-${stop.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [isActive, stop.id]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: stop.id,
    data: { dayIndex, stopId: stop.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const cat = categoryConfig[stop.category] ?? categoryConfig.sight;
  const tod = timeOfDayConfig[stop.time_of_day] ?? timeOfDayConfig.morning;
  const statusCfg = statusConfig[stop.status] ?? statusConfig.suggested;

  const handleKeep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stop.status === "suggested") onKeep(stop.id);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(stop.id);
  };

  const handleCardClick = () => {
    setExpanded((v) => !v);
    onFocus?.(stop.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative rounded-xl border transition-all duration-200 cursor-pointer
        ${isDragging ? "shadow-2xl shadow-violet-500/20 scale-105" : ""}
        ${isActive
          ? "border-violet-500/40 bg-violet-500/5 shadow-lg shadow-violet-500/10"
          : "border-white/6 bg-[var(--bg-surface)] hover:border-white/12 hover:bg-white/2"
        }
      `}
      onClick={handleCardClick}
      id={`stop-${stop.id}`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col gap-0.5 pt-1.5 shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          aria-label="Drag to reorder"
        >
          <span className="w-3.5 h-0.5 rounded-full bg-[var(--text-muted)]" />
          <span className="w-3.5 h-0.5 rounded-full bg-[var(--text-muted)]" />
          <span className="w-3.5 h-0.5 rounded-full bg-[var(--text-muted)]" />
        </button>

        {/* Stop number + category icon */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${cat.bgColor}`}
          >
            {cat.icon}
          </div>
          {/* Timeline line */}
          <div className="w-px flex-1 min-h-[8px] bg-white/6 rounded-full" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className={`text-xs ${tod.color} shrink-0`}>
                  {tod.icon} {tod.label}
                </span>
                <span className="text-xs text-[var(--text-muted)]">·</span>
                <span className="text-xs text-[var(--text-muted)] shrink-0">
                  {formatDuration(stop.duration_minutes)}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug truncate">
                {stop.name}
              </h3>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {stop.status === "suggested" && (
                <button
                  id={`keep-stop-${stop.id}`}
                  onClick={handleKeep}
                  title="Mark as kept"
                  className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 text-xs hover:bg-emerald-500/25 transition-colors flex items-center justify-center"
                >
                  ✓
                </button>
              )}
              <button
                id={`remove-stop-${stop.id}`}
                onClick={handleRemove}
                title="Remove stop"
                className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-400 text-xs hover:bg-rose-500/20 transition-colors flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} shrink-0`} />
            <span className={`text-xs ${statusCfg.color}`}>{statusCfg.label}</span>
            <span className="text-xs text-[var(--text-muted)]">·</span>
            <span className={`text-xs ${cat.color}`}>{cat.label}</span>
          </div>

          {/* Expandable description + Photo */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expanded ? "max-h-[500px] mt-3 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-t border-white/6 pt-3 space-y-3">
              {/* Photo */}
              <div className="relative w-full h-32 rounded-lg overflow-hidden group/img">
                <img 
                  src={`https://picsum.photos/seed/${stop.id}/400/200`} 
                  alt={stop.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" 
                />
                <div className="absolute inset-0 bg-black/10 group-hover/img:bg-transparent transition-colors" />
              </div>
              
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {stop.description}
              </p>
            </div>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all duration-200 mt-1"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse stop" : "Expand stop"}
        >
          <span
            className={`inline-block transition-transform duration-200 text-xs ${
              expanded ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>
      </div>
    </div>
  );
}
