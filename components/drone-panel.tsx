"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dronePatrols, siteLocations } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface DronePanelProps {
  showPatrol: boolean
  onTogglePatrol: () => void
  onRequestMission?: (locationId: string) => void
}

export function DronePanel({ showPatrol, onTogglePatrol, onRequestMission }: DronePanelProps) {
  const [selectedPatrol, setSelectedPatrol] = useState(dronePatrols[1])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const restrictedLocations = siteLocations.filter((l) => l.restricted)

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Drone Operations
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              showPatrol
                ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                : "text-slate-400 border-slate-500/30"
            )}
          >
            {showPatrol ? "Active" : "Standby"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Drone Status */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  showPatrol ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                )}
              />
              <span className="text-sm font-medium text-white">UAV-03</span>
            </div>
            <span className="text-xs text-slate-400">Battery: 78%</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Status:</span>
              <span className="text-slate-300 ml-1">
                {showPatrol ? "On Patrol" : "Docked"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Flight Time:</span>
              <span className="text-slate-300 ml-1">2h 34m</span>
            </div>
          </div>

          <Button
            onClick={onTogglePatrol}
            variant={showPatrol ? "destructive" : "default"}
            className={cn(
              "w-full mt-3",
              !showPatrol && "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {showPatrol ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
                Stop Patrol
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Show Patrol Route
              </>
            )}
          </Button>
        </div>

        {/* Past Patrols */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-300">Overnight Patrols</div>
          {dronePatrols.map((patrol) => (
            <button
              key={patrol.id}
              onClick={() => setSelectedPatrol(patrol)}
              className={cn(
                "w-full text-left bg-slate-900/50 rounded-lg p-3 transition-colors",
                selectedPatrol.id === patrol.id
                  ? "ring-1 ring-blue-500 bg-blue-500/10"
                  : "hover:bg-slate-900"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{patrol.id}</span>
                <span className="text-xs text-slate-400">
                  {formatTime(patrol.startTime)} - {formatTime(patrol.endTime)}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {patrol.coverageAreas.length} areas covered
              </div>
            </button>
          ))}
        </div>

        {/* Selected Patrol Details */}
        {selectedPatrol && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">Patrol Observations</div>
            <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
              {selectedPatrol.observations.map((obs, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-blue-400 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span className="text-slate-300">{obs}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Mission Request */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-300">Request Follow-up Mission</div>
          <div className="grid grid-cols-2 gap-2">
            {restrictedLocations.slice(0, 4).map((loc) => (
              <Button
                key={loc.id}
                variant="outline"
                size="sm"
                onClick={() => onRequestMission?.(loc.id)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 justify-start text-xs"
              >
                <svg
                  className="w-3 h-3 mr-1 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {loc.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
