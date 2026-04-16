"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import type { SecurityEvent, AIAnalysis, ToolCall } from "@/lib/types"
import { generateBriefingSummary } from "@/lib/agent"
import { cn } from "@/lib/utils"

interface BriefingPanelProps {
  events: SecurityEvent[]
  analyses: Map<string, { analysis: AIAnalysis; toolCalls: ToolCall[] }>
  onExport?: () => void
}

export function BriefingPanel({ events, analyses, onExport }: BriefingPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [customNotes, setCustomNotes] = useState("")

  const [approved, setApproved] = useState(false)

  const briefing = generateBriefingSummary(events, analyses)

  // Categorize events by recommendation
  const escalations = events.filter(
    (e) => analyses.get(e.id)?.analysis.recommendation === "escalate"
  )
  const needsReview = events.filter(
    (e) => analyses.get(e.id)?.analysis.recommendation === "investigate"
  )
  const monitoring = events.filter(
    (e) => analyses.get(e.id)?.analysis.recommendation === "monitor"
  )
  const dismissed = events.filter(
    (e) => analyses.get(e.id)?.analysis.recommendation === "dismiss"
  )

  const currentTime = new Date()
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Morning Briefing
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{formattedTime}</span>
            {approved && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                Approved
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-red-500/10 rounded-lg p-2 text-center border border-red-500/20">
            <div className="text-xl font-bold text-red-400">{escalations.length}</div>
            <div className="text-xs text-red-400/70">Escalate</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-2 text-center border border-amber-500/20">
            <div className="text-xl font-bold text-amber-400">{needsReview.length}</div>
            <div className="text-xs text-amber-400/70">Review</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-2 text-center border border-blue-500/20">
            <div className="text-xl font-bold text-blue-400">{monitoring.length}</div>
            <div className="text-xs text-blue-400/70">Monitor</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-2 text-center border border-emerald-500/20">
            <div className="text-xl font-bold text-emerald-400">{dismissed.length}</div>
            <div className="text-xs text-emerald-400/70">Dismissed</div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-300">Key Findings</div>

          {escalations.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Requires Immediate Attention
              </div>
              {escalations.map((e) => (
                <div key={e.id} className="text-sm text-slate-300 ml-6">
                  • <span className="text-white">{e.location.name}:</span>{" "}
                  {analyses.get(e.id)?.analysis.summary}
                </div>
              ))}
            </div>
          )}

          {needsReview.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                Needs Investigation
              </div>
              {needsReview.map((e) => (
                <div key={e.id} className="text-sm text-slate-300 ml-6">
                  • <span className="text-white">{e.location.name}:</span>{" "}
                  {analyses.get(e.id)?.analysis.summary}
                </div>
              ))}
            </div>
          )}

          {dismissed.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Likely Harmless (Auto-Dismissed)
              </div>
              {dismissed.map((e) => (
                <div key={e.id} className="text-sm text-slate-400 ml-6">
                  • {e.location.name}: {analyses.get(e.id)?.analysis.summary}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operator Notes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Operator Notes</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-slate-400 hover:text-white h-7"
            >
              {isEditing ? "Done" : "Edit"}
            </Button>
          </div>
          {isEditing ? (
            <Textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Add your notes for the morning briefing..."
              className="bg-slate-900 border-slate-700 text-slate-300 min-h-[80px]"
            />
          ) : (
            <div className="bg-slate-900/50 rounded-lg p-3 min-h-[60px]">
              {customNotes ? (
                <p className="text-sm text-slate-300">{customNotes}</p>
              ) : (
                <p className="text-sm text-slate-500 italic">No notes added yet</p>
              )}
            </div>
          )}
        </div>

        {/* Raghav's Note */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            Note from Night Supervisor (Raghav)
          </div>
          <p className="text-sm text-slate-300 italic">
            {'"Please check Block C before leadership asks."'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={() => setApproved(true)}
            disabled={approved}
            className={cn(
              "flex-1",
              approved
                ? "bg-emerald-600 hover:bg-emerald-600"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {approved ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Approved
              </>
            ) : (
              "Approve Briefing"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onExport}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
