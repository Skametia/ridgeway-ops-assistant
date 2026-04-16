// Core domain types for the 6:10 Assistant

export type EventSeverity = "low" | "medium" | "high" | "critical"
export type EventStatus = "pending" | "investigating" | "resolved" | "escalated"
export type EventType = "fence_alert" | "vehicle_detection" | "badge_failure" | "drone_observation" | "motion_detected"

export interface SiteLocation {
  id: string
  name: string
  type: "gate" | "yard" | "zone" | "checkpoint" | "building"
  x: number // percentage position on map
  y: number
  restricted: boolean
}

export interface SecurityEvent {
  id: string
  type: EventType
  timestamp: Date
  location: SiteLocation
  severity: EventSeverity
  status: EventStatus
  description: string
  rawData: Record<string, unknown>
  relatedEventIds: string[]
  aiAnalysis?: AIAnalysis
}

export interface AIAnalysis {
  summary: string
  confidence: number // 0-1
  reasoning: string
  recommendation: "dismiss" | "monitor" | "investigate" | "escalate"
  uncertainties: string[]
  toolsUsed: string[]
}

export interface DronePatrol {
  id: string
  startTime: Date
  endTime: Date
  waypoints: { x: number; y: number; timestamp: Date }[]
  observations: string[]
  coverageAreas: string[]
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  output: unknown
  timestamp: Date
  duration: number
}

export interface AgentInvestigation {
  id: string
  eventIds: string[]
  status: "running" | "complete" | "error"
  toolCalls: ToolCall[]
  findings: string[]
  draftSummary: string
  humanOverride?: {
    approved: boolean
    notes: string
    modifiedAt: Date
  }
}

export interface MorningBriefing {
  generatedAt: Date
  timeRange: { start: Date; end: Date }
  summary: string
  keyFindings: BriefingItem[]
  escalations: SecurityEvent[]
  dismissed: SecurityEvent[]
  pendingReview: SecurityEvent[]
  droneActivity: DronePatrol[]
  actionItems: string[]
}

export interface BriefingItem {
  title: string
  description: string
  severity: EventSeverity
  eventIds: string[]
  recommendation: string
}
