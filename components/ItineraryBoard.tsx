"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { Itinerary, Stop } from "@/types/itinerary";
import DayTabs from "./DayTabs";
import StopCard from "./StopCard";
import MapPane from "./MapPane";
import RefinementBar from "./RefinementBar";
import UndoToast from "./UndoToast";
import { categoryConfig } from "@/lib/utils";

interface ItineraryBoardProps {
  itinerary: Itinerary;
  onUpdate: (updated: Itinerary) => void;
  onRefine: (instruction: string) => void;
  onNewTrip: () => void;
  isRefining: boolean;
}

interface ToastState {
  stopId: string;
  stopName: string;
  dayIndex: number;
  stopIndex: number;
  stop: Stop;
}

export default function ItineraryBoard({
  itinerary,
  onUpdate,
  onRefine,
  onNewTrip,
  isRefining,
}: ItineraryBoardProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeStopId, setActiveStopId] = useState<string | undefined>();
  const [draggingStop, setDraggingStop] = useState<Stop | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [mapCollapsed, setMapCollapsed] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeDay = itinerary.days[activeDayIndex] ?? itinerary.days[0];
  const currentStops = activeDay?.stops ?? [];

  // All stops in the current day for map display
  const allCurrentDayStops = currentStops;

  const handleDragStart = (event: DragStartEvent) => {
    const stop = currentStops.find((s) => s.id === event.active.id);
    if (stop) setDraggingStop(stop);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Inter-day dragging could be implemented here
    // For now we keep within-day reordering
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingStop(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = currentStops.findIndex((s) => s.id === active.id);
    const newIndex = currentStops.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newStops = arrayMove(currentStops, oldIndex, newIndex);
    const newItinerary: Itinerary = {
      ...itinerary,
      days: itinerary.days.map((d, i) =>
        i === activeDayIndex ? { ...d, stops: newStops } : d
      ),
    };
    onUpdate(newItinerary);
  };

  const handleRemove = useCallback(
    (stopId: string) => {
      const dayIndex = activeDayIndex;
      const stops = itinerary.days[dayIndex].stops;
      const stopIndex = stops.findIndex((s) => s.id === stopId);
      const stop = stops[stopIndex];
      if (!stop) return;

      const newStops = stops.filter((s) => s.id !== stopId);
      const newItinerary: Itinerary = {
        ...itinerary,
        days: itinerary.days.map((d, i) =>
          i === dayIndex ? { ...d, stops: newStops } : d
        ),
      };
      onUpdate(newItinerary);

      setToast({ stopId, stopName: stop.name, dayIndex, stopIndex, stop });
    },
    [activeDayIndex, itinerary, onUpdate]
  );

  const handleUndo = useCallback(() => {
    if (!toast) return;
    const { dayIndex, stopIndex, stop } = toast;
    const stops = itinerary.days[dayIndex].stops;
    const insertIndex = Math.min(stopIndex, stops.length);
    const newStops = [
      ...stops.slice(0, insertIndex),
      stop,
      ...stops.slice(insertIndex),
    ];
    const newItinerary: Itinerary = {
      ...itinerary,
      days: itinerary.days.map((d, i) =>
        i === dayIndex ? { ...d, stops: newStops } : d
      ),
    };
    onUpdate(newItinerary);
    setToast(null);
  }, [toast, itinerary, onUpdate]);

  const handleKeep = useCallback(
    (stopId: string) => {
      const newItinerary: Itinerary = {
        ...itinerary,
        days: itinerary.days.map((d) => ({
          ...d,
          stops: d.stops.map((s) =>
            s.id === stopId ? { ...s, status: "kept" as const } : s
          ),
        })),
      };
      onUpdate(newItinerary);
    },
    [itinerary, onUpdate]
  );

  const handleStopFocus = (stopId: string) => {
    setActiveStopId(stopId);
  };

  const totalStops = itinerary.days.reduce((acc, d) => acc + d.stops.length, 0);
  const keptStops = itinerary.days
    .flatMap((d) => d.stops)
    .filter((s) => s.status === "kept").length;

  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <header className="board-header">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <button onClick={onNewTrip} id="logo-btn" className="board-logo-btn">
            <div className="logo-mark">T</div>
            <span className="logo-text hidden sm:block">TripEasy</span>
          </button>

          <div className="h-4 w-px" style={{ background: "var(--border-strong)" }} />

          {/* Destination */}
          <div className="board-dest">
            <span style={{ fontSize: 14 }}>📍</span>
            <h1 className="board-dest-text">{itinerary.destination}</h1>
          </div>
        </div>

        <div className="board-actions">
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="stat-pill">
              <span className="stat-dot" />
              {totalStops} stops
            </div>
            {keptStops > 0 && (
              <div className="stat-pill">
                <span className="stat-dot stat-dot-green" />
                <span style={{ color: "#34d399" }}>{keptStops} kept</span>
              </div>
            )}
          </div>

          {/* Map toggle (mobile) */}
          <button
            id="map-toggle-btn"
            onClick={() => setMapCollapsed((v) => !v)}
            className="icon-btn lg:hidden"
          >
            {mapCollapsed ? "📋 List" : "🗺️ Map"}
          </button>

          {/* Export to PDF / Print */}
          <button
            onClick={() => window.print()}
            className="icon-btn hidden sm:flex"
            title="Export to PDF"
          >
            <span>🖨️</span>
            <span className="hidden md:inline">Print / PDF</span>
          </button>

          {/* Hotel/Flight Links */}
          <a
            href={`https://www.google.com/travel/flights?q=flights+to+${encodeURIComponent(itinerary.destination)}`}
            target="_blank"
            rel="noreferrer"
            className="icon-btn hidden sm:flex text-blue-400 hover:text-blue-300"
            title="Search Flights"
          >
            <span>✈️</span>
            <span className="hidden md:inline">Flights</span>
          </a>
          
          <a
            href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(itinerary.destination)}`}
            target="_blank"
            rel="noreferrer"
            className="icon-btn hidden sm:flex text-blue-400 hover:text-blue-300"
            title="Search Hotels"
          >
            <span>🏨</span>
            <span className="hidden md:inline">Hotels</span>
          </a>

          {/* New trip button */}
          <button id="new-trip-btn" onClick={onNewTrip} className="icon-btn">
            <span>+</span>
            <span className="hidden sm:inline">New trip</span>
          </button>
        </div>
      </header>

      {/* Day tabs */}
      <div className="day-tabs-bar">
        <DayTabs
          days={itinerary.days}
          activeDayIndex={activeDayIndex}
          onDayChange={setActiveDayIndex}
        />
        {activeDay?.label && (
          <div className="day-label-text hidden md:block">
            {activeDay.label}
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Stop list: show when mapCollapsed=false */}
        <div
          className={`board-list-panel ${
            mapCollapsed ? "hidden" : "flex"
          } lg:flex flex-col w-full lg:w-[420px] shrink-0 border-r border-white/6 overflow-hidden`}
        >
          {currentStops.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <div className="text-3xl mb-3">🌐</div>
                <p className="text-sm text-[var(--text-secondary)]">
                  No stops on this day.
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Use the refinement bar below to add some.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={currentStops.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {currentStops.map((stop, i) => (
                    <div
                      key={stop.id}
                      style={{
                        animation: `fadeInUp 0.3s ease forwards`,
                        animationDelay: `${i * 40}ms`,
                        opacity: 0,
                      }}
                    >
                      <StopCard
                        stop={stop}
                        index={i}
                        dayIndex={activeDayIndex}
                        onRemove={handleRemove}
                        onKeep={handleKeep}
                        isActive={stop.id === activeStopId}
                        onFocus={handleStopFocus}
                      />
                    </div>
                  ))}
                </SortableContext>

                <DragOverlay>
                  {draggingStop ? (
                    <div className="rounded-xl border border-violet-500/40 bg-violet-500/5 p-4 shadow-2xl shadow-violet-500/20 opacity-90">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center text-base">
                          {categoryConfig[draggingStop.category]?.icon ?? "📍"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {draggingStop.name}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {draggingStop.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          )}
        </div>

        {/* Map pane: show when mapCollapsed=true */}
        <div
          className={`${
            mapCollapsed ? "flex" : "hidden"
          } lg:flex flex-1 p-3 overflow-hidden`}
        >
          <MapPane
            stops={allCurrentDayStops}
            destination={itinerary.destination}
            activeStopId={activeStopId}
            onStopFocus={handleStopFocus}
          />
        </div>
      </div>

      {/* Refinement bar */}
      <RefinementBar
        itinerary={itinerary}
        onRefine={onRefine}
        isRefining={isRefining}
      />

      {/* Undo toast */}
      {toast && (
        <UndoToast
          message={`"${toast.stopName}" removed`}
          onUndo={handleUndo}
          onDismiss={() => setToast(null)}
          duration={5000}
        />
      )}
    </div>
  );
}
