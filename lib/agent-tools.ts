// MCP-style tool definitions for the AI agent
import { securityEvents, siteLocations, dronePatrols, getRelatedEvents } from "./mock-data"
import type { SecurityEvent, ToolCall } from "./types"

// Tool registry with MCP-like interface
export interface Tool {
  name: string
  description: string
  parameters: Record<string, { type: string; description: string; required?: boolean }>
  execute: (params: Record<string, unknown>) => Promise<unknown>
}

export const agentTools: Tool[] = [
  {
    name: "get_event_details",
    description: "Retrieves full details of a security event including raw sensor data",
    parameters: {
      eventId: { type: "string", description: "The ID of the event to retrieve", required: true },
    },
    execute: async (params) => {
      const event = securityEvents.find(e => e.id === params.eventId)
      if (!event) return { error: "Event not found", eventId: params.eventId }
      return {
        ...event,
        timestamp: event.timestamp.toISOString(),
      }
    },
  },
  {
    name: "get_related_events",
    description: "Finds events that are potentially related to a given event",
    parameters: {
      eventId: { type: "string", description: "The event ID to find relations for", required: true },
    },
    execute: async (params) => {
      const related = getRelatedEvents(params.eventId as string)
      return {
        eventId: params.eventId,
        relatedCount: related.length,
        events: related.map(e => ({
          id: e.id,
          type: e.type,
          timestamp: e.timestamp.toISOString(),
          location: e.location.name,
          severity: e.severity,
          description: e.description,
        })),
      }
    },
  },
  {
    name: "query_location_history",
    description: "Gets all events that occurred at a specific location within a time range",
    parameters: {
      locationId: { type: "string", description: "The location ID to query", required: true },
      hoursBack: { type: "number", description: "How many hours of history to retrieve" },
    },
    execute: async (params) => {
      const location = siteLocations.find(l => l.id === params.locationId)
      if (!location) return { error: "Location not found" }

      const hoursBack = (params.hoursBack as number) || 8
      const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000)

      const events = securityEvents.filter(
        e => e.location.id === params.locationId && e.timestamp >= cutoff
      )

      return {
        location: location.name,
        restricted: location.restricted,
        eventCount: events.length,
        events: events.map(e => ({
          id: e.id,
          type: e.type,
          timestamp: e.timestamp.toISOString(),
          severity: e.severity,
          description: e.description,
        })),
      }
    },
  },
  {
    name: "check_drone_coverage",
    description: "Checks if a location was covered by drone patrol and retrieves observations",
    parameters: {
      locationId: { type: "string", description: "The location ID to check", required: true },
    },
    execute: async (params) => {
      const location = siteLocations.find(l => l.id === params.locationId)
      if (!location) return { error: "Location not found" }

      const coveringPatrols = dronePatrols.filter(p =>
        p.coverageAreas.includes(params.locationId as string)
      )

      return {
        location: location.name,
        covered: coveringPatrols.length > 0,
        patrolCount: coveringPatrols.length,
        patrols: coveringPatrols.map(p => ({
          id: p.id,
          startTime: p.startTime.toISOString(),
          endTime: p.endTime.toISOString(),
          observations: p.observations,
        })),
      }
    },
  },
  {
    name: "lookup_employee",
    description: "Looks up employee information from a badge ID",
    parameters: {
      badgeId: { type: "string", description: "The badge ID to look up", required: true },
    },
    execute: async (params) => {
      // Simulated employee database lookup
      const employees: Record<string, unknown> = {
        "EMP-4421": {
          name: "Rajesh Sharma",
          department: "Maintenance",
          shift: "Day (7am-3pm)",
          accessLevel: 2,
          supervisor: "Priya Mehta",
          recentIncidents: 0,
          notes: "Transferred from Block A two weeks ago. Access update may be pending.",
        },
      }
      const employee = employees[params.badgeId as string]
      if (!employee) return { error: "Employee not found", badgeId: params.badgeId }
      return employee
    },
  },
  {
    name: "get_weather_data",
    description: "Retrieves weather conditions for a specific time",
    parameters: {
      timestamp: { type: "string", description: "ISO timestamp to check weather for" },
    },
    execute: async (params) => {
      // Simulated weather data
      const time = params.timestamp ? new Date(params.timestamp as string) : new Date()
      const hour = time.getHours()

      return {
        timestamp: time.toISOString(),
        conditions: hour < 6 ? "clear" : "partly_cloudy",
        windSpeed: hour < 4 ? "8 km/h" : "12 km/h",
        windDirection: "northwest",
        temperature: "18°C",
        visibility: "good",
        notes: hour < 4 ? "Calm conditions" : "Light gusts reported",
      }
    },
  },
  {
    name: "analyze_pattern",
    description: "Analyzes multiple events to identify patterns or correlations",
    parameters: {
      eventIds: { type: "array", description: "Array of event IDs to analyze", required: true },
    },
    execute: async (params) => {
      const ids = params.eventIds as string[]
      const events = securityEvents.filter(e => ids.includes(e.id))

      if (events.length === 0) return { error: "No events found" }

      // Simulate pattern analysis
      const locations = [...new Set(events.map(e => e.location.id))]
      const types = [...new Set(events.map(e => e.type))]
      const timeSpan = Math.abs(
        events[events.length - 1].timestamp.getTime() - events[0].timestamp.getTime()
      ) / (1000 * 60) // minutes

      const patterns: string[] = []

      if (locations.length === 1) {
        patterns.push(`All events occurred at ${events[0].location.name}`)
      }
      if (types.length === 1) {
        patterns.push(`All events are of type: ${types[0]}`)
      }
      if (timeSpan < 30) {
        patterns.push(`Events clustered within ${Math.round(timeSpan)} minutes`)
      }
      if (events.some(e => e.type === "badge_failure") && events.filter(e => e.type === "badge_failure").length >= 3) {
        patterns.push("Multiple badge failures detected - possible unauthorized access attempt")
      }

      return {
        analyzedEvents: events.length,
        timeSpanMinutes: Math.round(timeSpan),
        uniqueLocations: locations.length,
        uniqueTypes: types.length,
        patterns,
        riskAssessment: patterns.length > 1 ? "elevated" : "normal",
      }
    },
  },
]

// Execute a tool call and track it
export async function executeTool(
  toolName: string,
  params: Record<string, unknown>
): Promise<ToolCall> {
  const tool = agentTools.find(t => t.name === toolName)
  const startTime = Date.now()

  if (!tool) {
    return {
      id: `call-${Date.now()}`,
      name: toolName,
      input: params,
      output: { error: "Tool not found" },
      timestamp: new Date(),
      duration: 0,
    }
  }

  const output = await tool.execute(params)
  const duration = Date.now() - startTime

  return {
    id: `call-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: toolName,
    input: params,
    output,
    timestamp: new Date(),
    duration,
  }
}
