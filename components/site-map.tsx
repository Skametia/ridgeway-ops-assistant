"use client"

import { useEffect, useRef, useState } from "react"
import { siteLocations, dronePatrols } from "@/lib/mock-data"
import type { SecurityEvent, SiteLocation } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SiteMapProps {
  events: SecurityEvent[]
  selectedEventId?: string
  onLocationClick?: (location: SiteLocation) => void
  showDronePatrol?: boolean
  highlightedLocations?: string[]
}

export function SiteMap({
  events,
  selectedEventId,
  onLocationClick,
  showDronePatrol = false,
  highlightedLocations = [],
}: SiteMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dronePosition, setDronePosition] = useState<{ x: number; y: number } | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)

  // Count events per location
  const eventCountByLocation = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.location.id] = (acc[event.location.id] || 0) + 1
    return acc
  }, {})

  // Get severity for a location (highest among events)
  const getSeverityForLocation = (locationId: string) => {
    const locationEvents = events.filter(e => e.location.id === locationId)
    if (locationEvents.length === 0) return null

    const severityOrder = ["critical", "high", "medium", "low"]
    for (const severity of severityOrder) {
      if (locationEvents.some(e => e.severity === severity)) {
        return severity
      }
    }
    return "low"
  }

  // Animate drone patrol
  useEffect(() => {
    if (!showDronePatrol) {
      setDronePosition(null)
      return
    }

    const patrol = dronePatrols[1] // Use the second patrol which covers more areas
    const waypoints = patrol.waypoints
    let waypointIndex = 0
    let progress = 0

    const animate = () => {
      const current = waypoints[waypointIndex]
      const next = waypoints[(waypointIndex + 1) % waypoints.length]

      const x = current.x + (next.x - current.x) * progress
      const y = current.y + (next.y - current.y) * progress

      setDronePosition({ x, y })

      progress += 0.02
      if (progress >= 1) {
        progress = 0
        waypointIndex = (waypointIndex + 1) % waypoints.length
      }
    }

    const interval = setInterval(animate, 50)
    return () => clearInterval(interval)
  }, [showDronePatrol])

  // Draw drone path
  useEffect(() => {
    if (!canvasRef.current || !showDronePatrol) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const patrol = dronePatrols[1]
    const waypoints = patrol.waypoints

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw patrol path
    ctx.beginPath()
    ctx.strokeStyle = "rgba(59, 130, 246, 0.5)"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    waypoints.forEach((wp, index) => {
      const x = (wp.x / 100) * canvas.width
      const y = (wp.y / 100) * canvas.height
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.closePath()
    ctx.stroke()
  }, [showDronePatrol])

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 border-red-600"
      case "high":
        return "bg-orange-500 border-orange-600"
      case "medium":
        return "bg-amber-500 border-amber-600"
      case "low":
        return "bg-emerald-500 border-emerald-600"
      default:
        return "bg-slate-400 border-slate-500"
    }
  }

  const getLocationIcon = (type: SiteLocation["type"]) => {
    switch (type) {
      case "gate":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        )
      case "yard":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      case "zone":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case "checkpoint":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      case "building":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
    }
  }

  const selectedEvent = events.find(e => e.id === selectedEventId)

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100, 116, 139, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 116, 139, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Site boundary */}
      <div className="absolute inset-4 border-2 border-dashed border-slate-600 rounded-lg" />
      
      {/* Perimeter fence line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <rect
          x="5%"
          y="3%"
          width="90%"
          height="94%"
          fill="none"
          stroke="rgba(148, 163, 184, 0.4)"
          strokeWidth="3"
          strokeDasharray="10,5"
          rx="8"
        />
      </svg>

      {/* Canvas for drone path */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        width={800}
        height={600}
      />

      {/* Locations */}
      {siteLocations.map((location) => {
        const severity = getSeverityForLocation(location.id)
        const eventCount = eventCountByLocation[location.id] || 0
        const isSelected = selectedEvent?.location.id === location.id
        const isHighlighted = highlightedLocations.includes(location.id)
        const isHovered = hoveredLocation === location.id

        return (
          <button
            key={location.id}
            onClick={() => onLocationClick?.(location)}
            onMouseEnter={() => setHoveredLocation(location.id)}
            onMouseLeave={() => setHoveredLocation(null)}
            className={cn(
              "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200",
              "flex flex-col items-center gap-1",
              (isSelected || isHighlighted) && "scale-125 z-20"
            )}
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
          >
            {/* Location marker */}
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center border-2 shadow-lg transition-all",
                severity ? getSeverityColor(severity) : "bg-slate-700 border-slate-600",
                isSelected && "ring-2 ring-white ring-offset-2 ring-offset-slate-900",
                isHighlighted && !isSelected && "ring-2 ring-blue-400",
                location.restricted && "border-dashed"
              )}
            >
              <span className="text-white">{getLocationIcon(location.type)}</span>
            </div>

            {/* Event count badge */}
            {eventCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white text-slate-900 rounded-full text-xs font-bold flex items-center justify-center shadow">
                {eventCount}
              </div>
            )}

            {/* Location label */}
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap transition-all",
                isHovered || isSelected || isHighlighted
                  ? "bg-white text-slate-900"
                  : "bg-slate-800/80 text-slate-300"
              )}
            >
              {location.name}
            </span>

            {/* Restricted indicator */}
            {location.restricted && (
              <span className="text-[10px] text-amber-400 font-medium">RESTRICTED</span>
            )}
          </button>
        )
      })}

      {/* Drone marker */}
      {showDronePatrol && dronePosition && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-50"
          style={{ left: `${dronePosition.x}%`, top: `${dronePosition.y}%` }}
        >
          <div className="relative">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div className="absolute inset-0 w-8 h-8 bg-blue-400 rounded-full animate-ping opacity-30" />
          </div>
          <span className="absolute top-10 left-1/2 -translate-x-1/2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded whitespace-nowrap">
            UAV-03
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-slate-800/90 backdrop-blur rounded-lg p-3 text-xs">
        <div className="font-semibold text-white mb-2">Severity</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-slate-300">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-slate-300">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-slate-300">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-slate-300">Low</span>
          </div>
        </div>
      </div>

      {/* Site name */}
      <div className="absolute top-3 left-3 bg-slate-800/90 backdrop-blur rounded-lg px-3 py-2">
        <div className="text-sm font-semibold text-white">Ridgeway Industrial Site</div>
        <div className="text-xs text-slate-400">Perimeter Map View</div>
      </div>
    </div>
  )
}
