// AI Agent that investigates security events using tools
import { executeTool, agentTools } from "./agent-tools"
import { securityEvents } from "./mock-data"
import type { SecurityEvent, AIAnalysis, ToolCall, AgentInvestigation } from "./types"

// Simulate AI reasoning about which tools to use
function decideToolsForEvent(event: SecurityEvent): Array<{ tool: string; params: Record<string, unknown> }> {
  const toolCalls: Array<{ tool: string; params: Record<string, unknown> }> = []

  // Always get full event details first
  toolCalls.push({ tool: "get_event_details", params: { eventId: event.id } })

  // Check for related events
  if (event.relatedEventIds.length > 0) {
    toolCalls.push({ tool: "get_related_events", params: { eventId: event.id } })
  }

  // Event-specific tool decisions
  switch (event.type) {
    case "fence_alert":
      toolCalls.push({ tool: "get_weather_data", params: { timestamp: event.timestamp.toISOString() } })
      toolCalls.push({ tool: "check_drone_coverage", params: { locationId: event.location.id } })
      break

    case "vehicle_detection":
      toolCalls.push({ tool: "query_location_history", params: { locationId: event.location.id, hoursBack: 4 } })
      toolCalls.push({ tool: "check_drone_coverage", params: { locationId: event.location.id } })
      break

    case "badge_failure":
      if (event.rawData.badgeId) {
        toolCalls.push({ tool: "lookup_employee", params: { badgeId: event.rawData.badgeId } })
      }
      // Check for pattern if multiple badge failures
      const badgeEvents = securityEvents.filter(
        e => e.type === "badge_failure" && e.rawData.badgeId === event.rawData.badgeId
      )
      if (badgeEvents.length > 1) {
        toolCalls.push({ 
          tool: "analyze_pattern", 
          params: { eventIds: badgeEvents.map(e => e.id) } 
        })
      }
      break

    case "motion_detected":
      toolCalls.push({ tool: "query_location_history", params: { locationId: event.location.id, hoursBack: 2 } })
      break

    case "drone_observation":
      // Drone observations usually have enough context already
      break
  }

  return toolCalls
}

// Generate AI analysis based on tool results
function generateAnalysis(
  event: SecurityEvent,
  toolResults: ToolCall[]
): AIAnalysis {
  const toolsUsed = toolResults.map(t => t.name)
  const uncertainties: string[] = []

  // Analyze based on event type and tool results
  let summary = ""
  let confidence = 0.7
  let reasoning = ""
  let recommendation: AIAnalysis["recommendation"] = "monitor"

  switch (event.type) {
    case "fence_alert": {
      const weatherResult = toolResults.find(t => t.name === "get_weather_data")
      const droneResult = toolResults.find(t => t.name === "check_drone_coverage")

      const weather = weatherResult?.output as Record<string, unknown> | undefined
      const droneCoverage = droneResult?.output as Record<string, unknown> | undefined

      if (weather?.windSpeed && parseInt(weather.windSpeed as string) > 10) {
        summary = "Fence alert likely caused by wind. Weather data shows gusty conditions at time of alert."
        confidence = 0.85
        reasoning = `Wind speed was ${weather.windSpeed} with ${weather.notes}. Drone patrol later confirmed debris (plastic sheet) on fence.`
        recommendation = "dismiss"
      } else {
        summary = "Fence alert requires attention. Weather conditions were calm."
        confidence = 0.6
        reasoning = "Cannot definitively attribute to environmental factors."
        recommendation = "investigate"
        uncertainties.push("Unable to confirm cause without visual inspection")
      }

      if (droneCoverage?.covered) {
        const patrols = droneCoverage.patrols as Array<{ observations: string[] }>
        if (patrols?.some(p => p.observations.some(o => o.toLowerCase().includes("debris")))) {
          confidence += 0.1
          reasoning += " Drone observation corroborates environmental cause."
        }
      }
      break
    }

    case "vehicle_detection": {
      const historyResult = toolResults.find(t => t.name === "query_location_history")
      const droneResult = toolResults.find(t => t.name === "check_drone_coverage")

      const history = historyResult?.output as Record<string, unknown> | undefined
      const droneCoverage = droneResult?.output as Record<string, unknown> | undefined

      summary = "Unauthorized vehicle detected near restricted storage yard. Requires investigation."
      confidence = 0.75
      reasoning = `Vehicle (pickup truck) detected traveling at 15 km/h near restricted area. License plate only partially captured (${event.rawData.licensePlate}).`

      if (history?.eventCount && (history.eventCount as number) > 1) {
        reasoning += ` Additional motion detected in the area within the same timeframe.`
        recommendation = "escalate"
        confidence = 0.82
      } else {
        recommendation = "investigate"
      }

      if (droneCoverage?.covered) {
        const patrols = droneCoverage.patrols as Array<{ observations: string[] }>
        if (patrols?.some(p => p.observations.some(o => o.toLowerCase().includes("no activity")))) {
          reasoning += " However, drone patrol found no activity during flyover - may have been transient."
          uncertainties.push("Drone patrol showed no activity - timing gap possible")
          confidence -= 0.1
        }
      }

      uncertainties.push("Partial license plate - full identification not possible")
      break
    }

    case "badge_failure": {
      const employeeResult = toolResults.find(t => t.name === "lookup_employee")
      const patternResult = toolResults.find(t => t.name === "analyze_pattern")

      const employee = employeeResult?.output as Record<string, unknown> | undefined
      const pattern = patternResult?.output as Record<string, unknown> | undefined

      if (employee && !("error" in employee)) {
        summary = `Badge failures from ${employee.name} (${employee.department}). Employee recently transferred, access permissions may need update.`
        reasoning = `Employee ${employee.name} attempted access during off-duty hours (shift: ${employee.shift}). Access level is ${employee.accessLevel}, which may be insufficient for this checkpoint. Notes indicate recent transfer.`

        if (pattern?.patterns) {
          const patterns = pattern.patterns as string[]
          if (patterns.some(p => p.includes("Multiple badge failures"))) {
            recommendation = "investigate"
            confidence = 0.78
            reasoning += " Three consecutive failures resulted in badge lockout."
            uncertainties.push("Could be legitimate access attempt with outdated permissions")
          } else {
            recommendation = "monitor"
            confidence = 0.7
          }
        }
      } else {
        summary = "Badge failure from unknown badge ID. Requires security review."
        reasoning = "Badge ID not found in employee database."
        recommendation = "escalate"
        confidence = 0.9
        uncertainties.push("Unknown badge - possible security breach")
      }
      break
    }

    case "motion_detected": {
      const historyResult = toolResults.find(t => t.name === "query_location_history")
      const history = historyResult?.output as Record<string, unknown> | undefined

      summary = "Motion detected in restricted storage yard. Correlated with vehicle detection."
      reasoning = "Motion sensor triggered shortly after unauthorized vehicle was detected in the same area."

      if (history?.eventCount && (history.eventCount as number) > 1) {
        recommendation = "investigate"
        confidence = 0.75
        reasoning += " Multiple events at this location suggest activity that warrants review."
      } else {
        recommendation = "monitor"
        confidence = 0.65
      }

      uncertainties.push("Motion sensor cannot distinguish between human and animal")
      break
    }

    case "drone_observation": {
      summary = event.description
      reasoning = "Standard drone patrol observation. No anomalies detected by automated systems."
      recommendation = "dismiss"
      confidence = 0.9
      break
    }

    default:
      summary = event.description
      reasoning = "Insufficient data for automated analysis."
      recommendation = "investigate"
      confidence = 0.5
      uncertainties.push("Event type not fully supported by automated analysis")
  }

  return {
    summary,
    confidence: Math.min(confidence, 0.95), // Never fully confident
    reasoning,
    recommendation,
    uncertainties,
    toolsUsed,
  }
}

// Main investigation function
export async function investigateEvent(event: SecurityEvent): Promise<{
  analysis: AIAnalysis
  toolCalls: ToolCall[]
}> {
  const plannedCalls = decideToolsForEvent(event)
  const toolCalls: ToolCall[] = []

  // Execute each tool call
  for (const planned of plannedCalls) {
    const result = await executeTool(planned.tool, planned.params)
    toolCalls.push(result)
    // Small delay to simulate real API calls
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const analysis = generateAnalysis(event, toolCalls)

  return { analysis, toolCalls }
}

// Investigate all pending events
export async function investigateAllEvents(
  events: SecurityEvent[],
  onProgress?: (completed: number, total: number, currentEvent: SecurityEvent) => void
): Promise<Map<string, { analysis: AIAnalysis; toolCalls: ToolCall[] }>> {
  const results = new Map<string, { analysis: AIAnalysis; toolCalls: ToolCall[] }>()

  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    if (onProgress) {
      onProgress(i, events.length, event)
    }

    const result = await investigateEvent(event)
    results.set(event.id, result)

    // Small delay between events
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  if (onProgress) {
    onProgress(events.length, events.length, events[events.length - 1])
  }

  return results
}

// Generate morning briefing summary
export function generateBriefingSummary(
  events: SecurityEvent[],
  analyses: Map<string, { analysis: AIAnalysis; toolCalls: ToolCall[] }>
): string {
  const escalations = events.filter(e => analyses.get(e.id)?.analysis.recommendation === "escalate")
  const investigate = events.filter(e => analyses.get(e.id)?.analysis.recommendation === "investigate")
  const dismissed = events.filter(e => analyses.get(e.id)?.analysis.recommendation === "dismiss")

  let summary = `## Overnight Summary (${new Date().toLocaleDateString()})\n\n`
  summary += `**Total Events:** ${events.length} | `
  summary += `**Escalations:** ${escalations.length} | `
  summary += `**Needs Review:** ${investigate.length} | `
  summary += `**Dismissed:** ${dismissed.length}\n\n`

  if (escalations.length > 0) {
    summary += `### Requires Immediate Attention\n`
    escalations.forEach(e => {
      const analysis = analyses.get(e.id)?.analysis
      summary += `- **${e.location.name}**: ${analysis?.summary}\n`
    })
    summary += "\n"
  }

  if (investigate.length > 0) {
    summary += `### Needs Investigation\n`
    investigate.forEach(e => {
      const analysis = analyses.get(e.id)?.analysis
      summary += `- **${e.location.name}** (${e.type.replace("_", " ")}): ${analysis?.summary}\n`
    })
    summary += "\n"
  }

  if (dismissed.length > 0) {
    summary += `### Likely Harmless (AI Dismissed)\n`
    dismissed.forEach(e => {
      const analysis = analyses.get(e.id)?.analysis
      summary += `- ${e.location.name}: ${analysis?.summary} (${Math.round((analysis?.confidence || 0) * 100)}% confidence)\n`
    })
  }

  return summary
}

// Get available tools for display
export function getAvailableTools() {
  return agentTools.map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }))
}
