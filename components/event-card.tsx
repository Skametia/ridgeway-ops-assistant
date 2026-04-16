"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { SecurityEvent, AIAnalysis, ToolCall } from "@/lib/types"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: SecurityEvent
  analysis?: AIAnalysis
  toolCalls?: ToolCall[]
  isSelected?: boolean
  onSelect?: () => void
  onStatusChange?: (eventId: string, status: SecurityEvent["status"]) => void
}

export function EventCard({
  event,
  analysis,
  toolCalls = [],
  isSelected,
  onSelect,
  onStatusChange,
}: EventCardProps) {
  const [showTools, setShowTools] = useState(false)
  const [showRawData, setShowRawData] = useState(false)

  const severityColors = {
    critical: "bg-red-500/10 text-red-500 border-red-500/30",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  }

  const statusColors = {
    pending: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    investigating: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    escalated: "bg-red-500/10 text-red-400 border-red-500/30",
  }

  const recommendationColors = {
    dismiss: "text-emerald-400",
    monitor: "text-blue-400",
    investigate: "text-amber-400",
    escalate: "text-red-400",
  }

  const eventTypeLabels = {
    fence_alert: "Fence Alert",
    vehicle_detection: "Vehicle Detection",
    badge_failure: "Badge Failure",
    drone_observation: "Drone Observation",
    motion_detected: "Motion Detected",
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 border-2",
        isSelected
          ? "border-blue-500 bg-blue-500/5"
          : "border-transparent hover:border-slate-700 bg-slate-800/50"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-white">
              {event.location.name}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={severityColors[event.severity]}>
                {event.severity}
              </Badge>
              <Badge variant="outline" className={statusColors[event.status]}>
                {event.status}
              </Badge>
              <span className="text-xs text-slate-500">
                {eventTypeLabels[event.type]}
              </span>
            </div>
          </div>
          <span className="text-sm text-slate-400 whitespace-nowrap">
            {formatTime(event.timestamp)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-slate-300">{event.description}</p>

        {/* AI Analysis */}
        {analysis && (
          <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">AI Analysis</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {Math.round(analysis.confidence * 100)}% confidence
                </span>
                <span className={cn("text-xs font-medium", recommendationColors[analysis.recommendation])}>
                  {analysis.recommendation.toUpperCase()}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-300">{analysis.summary}</p>
            
            {analysis.uncertainties.length > 0 && (
              <div className="pt-2 border-t border-slate-700">
                <span className="text-xs text-amber-400 font-medium">Uncertainties:</span>
                <ul className="text-xs text-slate-400 mt-1 space-y-0.5">
                  {analysis.uncertainties.map((u, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-amber-400">•</span>
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tool Calls Collapsible */}
        {toolCalls.length > 0 && (
          <Collapsible open={showTools} onOpenChange={setShowTools}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-slate-400 hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  {toolCalls.length} tool calls
                </span>
                <svg
                  className={cn("w-4 h-4 transition-transform", showTools && "rotate-180")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {toolCalls.map((call) => (
                <div
                  key={call.id}
                  className="bg-slate-900 rounded p-2 text-xs font-mono"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between text-blue-400">
                    <span>{call.name}</span>
                    <span className="text-slate-500">{call.duration}ms</span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    Input: {JSON.stringify(call.input)}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Raw Data Collapsible */}
        <Collapsible open={showRawData} onOpenChange={setShowRawData}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-slate-400 hover:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                Raw sensor data
              </span>
              <svg
                className={cn("w-4 h-4 transition-transform", showRawData && "rotate-180")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <pre
              className="bg-slate-900 rounded p-2 text-xs font-mono text-slate-400 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {JSON.stringify(event.rawData, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
            onClick={() => onStatusChange?.(event.id, "resolved")}
          >
            Dismiss
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
            onClick={() => onStatusChange?.(event.id, "investigating")}
          >
            Investigate
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-red-400 border-red-400/30 hover:bg-red-400/10"
            onClick={() => onStatusChange?.(event.id, "escalated")}
          >
            Escalate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
