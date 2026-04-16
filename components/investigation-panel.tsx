"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import type { SecurityEvent, AIAnalysis, ToolCall } from "@/lib/types"
import { cn } from "@/lib/utils"

interface InvestigationPanelProps {
  events: SecurityEvent[]
  analyses: Map<string, { analysis: AIAnalysis; toolCalls: ToolCall[] }>
  isInvestigating: boolean
  progress: { current: number; total: number; currentEvent?: SecurityEvent }
  onStartInvestigation: () => void
}

export function InvestigationPanel({
  events,
  analyses,
  isInvestigating,
  progress,
  onStartInvestigation,
}: InvestigationPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tools" | "reasoning">("overview")

  const pendingEvents = events.filter(e => e.status === "pending")
  const analyzedCount = analyses.size
  const totalToolCalls = Array.from(analyses.values()).reduce(
    (sum, a) => sum + a.toolCalls.length,
    0
  )

  // Count by recommendation
  const recommendations = Array.from(analyses.values()).reduce<Record<string, number>>(
    (acc, { analysis }) => {
      acc[analysis.recommendation] = (acc[analysis.recommendation] || 0) + 1
      return acc
    },
    {}
  )

  const averageConfidence =
    analyses.size > 0
      ? Array.from(analyses.values()).reduce((sum, a) => sum + a.analysis.confidence, 0) /
        analyses.size
      : 0

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Investigation
          </CardTitle>
          {!isInvestigating && pendingEvents.length > 0 && (
            <Button
              onClick={onStartInvestigation}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Investigate All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Investigation Progress */}
        {isInvestigating && (
          <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Investigating events...</span>
              <span className="text-sm text-slate-400">
                {progress.current} / {progress.total}
              </span>
            </div>
            <Progress
              value={(progress.current / progress.total) * 100}
              className="h-2"
            />
            {progress.currentEvent && (
              <div className="flex items-center gap-2 text-sm">
                <Spinner className="w-4 h-4" />
                <span className="text-slate-400">
                  Analyzing: {progress.currentEvent.location.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Stats Overview */}
        {!isInvestigating && analyzedCount > 0 && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1">
              {(["overview", "tools", "reasoning"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    activeTab === tab
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{analyzedCount}</div>
                  <div className="text-xs text-slate-400">Events Analyzed</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{totalToolCalls}</div>
                  <div className="text-xs text-slate-400">Tool Calls Made</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.round(averageConfidence * 100)}%
                  </div>
                  <div className="text-xs text-slate-400">Avg Confidence</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-emerald-400">
                    {recommendations.dismiss || 0}
                  </div>
                  <div className="text-xs text-slate-400">Auto-Dismissed</div>
                </div>
              </div>
            )}

            {activeTab === "overview" && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-300">Recommendations</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(recommendations).map(([rec, count]) => (
                    <Badge
                      key={rec}
                      variant="outline"
                      className={cn(
                        "px-3 py-1",
                        rec === "dismiss" && "text-emerald-400 border-emerald-400/30",
                        rec === "monitor" && "text-blue-400 border-blue-400/30",
                        rec === "investigate" && "text-amber-400 border-amber-400/30",
                        rec === "escalate" && "text-red-400 border-red-400/30"
                      )}
                    >
                      {rec}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "tools" && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-300">Tools Used</div>
                <div className="space-y-1.5">
                  {(() => {
                    const toolUsage: Record<string, number> = {}
                    Array.from(analyses.values()).forEach(({ toolCalls }) => {
                      toolCalls.forEach((call) => {
                        toolUsage[call.name] = (toolUsage[call.name] || 0) + 1
                      })
                    })
                    return Object.entries(toolUsage)
                      .sort((a, b) => b[1] - a[1])
                      .map(([name, count]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between bg-slate-900/50 rounded px-3 py-2"
                        >
                          <span className="text-sm text-slate-300 font-mono">{name}</span>
                          <Badge variant="secondary" className="bg-slate-700">
                            {count}x
                          </Badge>
                        </div>
                      ))
                  })()}
                </div>
              </div>
            )}

            {activeTab === "reasoning" && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Array.from(analyses.entries()).map(([eventId, { analysis }]) => {
                  const event = events.find((e) => e.id === eventId)
                  if (!event) return null
                  return (
                    <div
                      key={eventId}
                      className="bg-slate-900/50 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          {event.location.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            analysis.recommendation === "dismiss" &&
                              "text-emerald-400 border-emerald-400/30",
                            analysis.recommendation === "monitor" &&
                              "text-blue-400 border-blue-400/30",
                            analysis.recommendation === "investigate" &&
                              "text-amber-400 border-amber-400/30",
                            analysis.recommendation === "escalate" &&
                              "text-red-400 border-red-400/30"
                          )}
                        >
                          {analysis.recommendation}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{analysis.reasoning}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isInvestigating && analyzedCount === 0 && (
          <div className="text-center py-6">
            <svg
              className="w-12 h-12 text-slate-600 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-sm text-slate-400">
              {pendingEvents.length > 0
                ? `${pendingEvents.length} events waiting for investigation`
                : "No pending events to investigate"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
