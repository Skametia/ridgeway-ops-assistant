"use client"

import type { SecurityEvent } from "@/lib/types"
import { cn } from "@/lib/utils"

interface EventTimelineProps {
  events: SecurityEvent[]
  selectedEventId?: string
  onSelectEvent: (eventId: string) => void
}

export function EventTimeline({ events, selectedEventId, onSelectEvent }: EventTimelineProps) {
  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  )

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getEventIcon = (type: SecurityEvent["type"]) => {
    switch (type) {
      case "fence_alert":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case "vehicle_detection":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        )
      case "badge_failure":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case "drone_observation":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )
      case "motion_detected":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
    }
  }

  const severityColors = {
    critical: "bg-red-500 border-red-400",
    high: "bg-orange-500 border-orange-400",
    medium: "bg-amber-500 border-amber-400",
    low: "bg-emerald-500 border-emerald-400",
  }

  return (
    <div className="space-y-1">
      {sortedEvents.map((event, index) => (
        <button
          key={event.id}
          onClick={() => onSelectEvent(event.id)}
          className={cn(
            "w-full text-left relative pl-8 pr-3 py-2 rounded-lg transition-all",
            selectedEventId === event.id
              ? "bg-blue-500/10 ring-1 ring-blue-500"
              : "hover:bg-slate-800/50"
          )}
        >
          {/* Timeline line */}
          {index < sortedEvents.length - 1 && (
            <div className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-700" />
          )}

          {/* Timeline dot */}
          <div
            className={cn(
              "absolute left-2 top-3 w-4 h-4 rounded-full border-2 flex items-center justify-center",
              severityColors[event.severity]
            )}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>

          {/* Content */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">
                  {event.location.name}
                </span>
                <span className="text-slate-500">{getEventIcon(event.type)}</span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {event.description}
              </p>
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {formatTime(event.timestamp)}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
