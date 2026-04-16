import type { SecurityEvent, SiteLocation, DronePatrol } from "./types"

// Site locations for Ridgeway Industrial Facility
export const siteLocations: SiteLocation[] = [
  { id: "gate-1", name: "Main Gate", type: "gate", x: 10, y: 50, restricted: false },
  { id: "gate-2", name: "Service Gate", type: "gate", x: 90, y: 30, restricted: false },
  { id: "gate-3", name: "Gate 3 (North)", type: "gate", x: 50, y: 5, restricted: true },
  { id: "yard-a", name: "Storage Yard A", type: "yard", x: 25, y: 25, restricted: false },
  { id: "yard-b", name: "Storage Yard B", type: "yard", x: 70, y: 65, restricted: true },
  { id: "block-c", name: "Block C", type: "zone", x: 45, y: 70, restricted: true },
  { id: "checkpoint-1", name: "Checkpoint Alpha", type: "checkpoint", x: 30, y: 45, restricted: false },
  { id: "checkpoint-2", name: "Checkpoint Bravo", type: "checkpoint", x: 65, y: 40, restricted: true },
  { id: "building-ops", name: "Operations Building", type: "building", x: 15, y: 75, restricted: false },
  { id: "building-warehouse", name: "Main Warehouse", type: "building", x: 55, y: 45, restricted: false },
]

// Helper to create dates relative to "now" (6:10 AM)
function hoursAgo(hours: number): Date {
  const now = new Date()
  now.setHours(6, 10, 0, 0)
  return new Date(now.getTime() - hours * 60 * 60 * 1000)
}

// The night's security events
export const securityEvents: SecurityEvent[] = [
  {
    id: "evt-001",
    type: "fence_alert",
    timestamp: hoursAgo(5.5),
    location: siteLocations.find(l => l.id === "gate-3")!,
    severity: "medium",
    status: "pending",
    description: "Perimeter fence vibration detected near Gate 3. Duration: 4 seconds.",
    rawData: {
      sensorId: "FENCE-N-042",
      amplitude: 0.73,
      duration: 4.2,
      windSpeed: "12 km/h",
    },
    relatedEventIds: ["evt-004"],
  },
  {
    id: "evt-002",
    type: "vehicle_detection",
    timestamp: hoursAgo(4.2),
    location: siteLocations.find(l => l.id === "yard-b")!,
    severity: "high",
    status: "pending",
    description: "Unauthorized vehicle path detected near restricted Storage Yard B.",
    rawData: {
      vehicleType: "pickup_truck",
      licensePlate: "PARTIAL-X7",
      speed: "15 km/h",
      direction: "southwest",
      confidence: 0.82,
    },
    relatedEventIds: ["evt-005"],
  },
  {
    id: "evt-003",
    type: "badge_failure",
    timestamp: hoursAgo(3.8),
    location: siteLocations.find(l => l.id === "checkpoint-2")!,
    severity: "medium",
    status: "pending",
    description: "Failed badge swipe at Checkpoint Bravo. Badge ID: EMP-4421.",
    rawData: {
      badgeId: "EMP-4421",
      employeeName: "R. Sharma",
      department: "Maintenance",
      failureReason: "access_level_insufficient",
      shiftStatus: "off_duty",
    },
    relatedEventIds: ["evt-006", "evt-007"],
  },
  {
    id: "evt-004",
    type: "drone_observation",
    timestamp: hoursAgo(2.5),
    location: siteLocations.find(l => l.id === "gate-3")!,
    severity: "low",
    status: "pending",
    description: "Drone patrol captured image of Gate 3 area. No visible intrusion, debris noted on fence.",
    rawData: {
      droneId: "UAV-03",
      imageRef: "IMG-20240115-0342-G3",
      weatherConditions: "light_wind",
      thermalSignature: "none",
      visualNotes: "plastic_sheet_on_fence",
    },
    relatedEventIds: ["evt-001"],
  },
  {
    id: "evt-005",
    type: "motion_detected",
    timestamp: hoursAgo(4.0),
    location: siteLocations.find(l => l.id === "yard-b")!,
    severity: "medium",
    status: "pending",
    description: "Motion sensor triggered in Storage Yard B shortly after vehicle detection.",
    rawData: {
      sensorId: "MOT-YB-007",
      duration: 12,
      pattern: "continuous_movement",
      size: "human_or_larger",
    },
    relatedEventIds: ["evt-002"],
  },
  {
    id: "evt-006",
    type: "badge_failure",
    timestamp: hoursAgo(3.5),
    location: siteLocations.find(l => l.id === "checkpoint-2")!,
    severity: "medium",
    status: "pending",
    description: "Second failed badge swipe at Checkpoint Bravo. Same badge ID: EMP-4421.",
    rawData: {
      badgeId: "EMP-4421",
      employeeName: "R. Sharma",
      department: "Maintenance",
      failureReason: "access_level_insufficient",
      attemptNumber: 2,
    },
    relatedEventIds: ["evt-003", "evt-007"],
  },
  {
    id: "evt-007",
    type: "badge_failure",
    timestamp: hoursAgo(3.3),
    location: siteLocations.find(l => l.id === "checkpoint-2")!,
    severity: "high",
    status: "pending",
    description: "Third failed badge attempt. Badge temporarily locked.",
    rawData: {
      badgeId: "EMP-4421",
      employeeName: "R. Sharma",
      department: "Maintenance",
      failureReason: "badge_locked",
      attemptNumber: 3,
      lockDuration: "30_minutes",
    },
    relatedEventIds: ["evt-003", "evt-006"],
  },
  {
    id: "evt-008",
    type: "drone_observation",
    timestamp: hoursAgo(1.5),
    location: siteLocations.find(l => l.id === "block-c")!,
    severity: "low",
    status: "pending",
    description: "Routine drone patrol of Block C. All clear, no anomalies detected.",
    rawData: {
      droneId: "UAV-03",
      patrolType: "scheduled",
      coverage: "complete",
      notes: "perimeter_intact",
    },
    relatedEventIds: [],
  },
]

// Drone patrol data
export const dronePatrols: DronePatrol[] = [
  {
    id: "patrol-001",
    startTime: hoursAgo(6),
    endTime: hoursAgo(5),
    waypoints: [
      { x: 15, y: 75, timestamp: hoursAgo(6) },
      { x: 10, y: 50, timestamp: hoursAgo(5.8) },
      { x: 25, y: 25, timestamp: hoursAgo(5.6) },
      { x: 50, y: 5, timestamp: hoursAgo(5.4) },
      { x: 70, y: 25, timestamp: hoursAgo(5.2) },
      { x: 90, y: 30, timestamp: hoursAgo(5.1) },
      { x: 15, y: 75, timestamp: hoursAgo(5) },
    ],
    observations: ["All gates secure", "Light traffic at Main Gate"],
    coverageAreas: ["gate-1", "gate-2", "gate-3", "yard-a"],
  },
  {
    id: "patrol-002",
    startTime: hoursAgo(3),
    endTime: hoursAgo(2),
    waypoints: [
      { x: 15, y: 75, timestamp: hoursAgo(3) },
      { x: 30, y: 45, timestamp: hoursAgo(2.8) },
      { x: 50, y: 5, timestamp: hoursAgo(2.6) },
      { x: 55, y: 45, timestamp: hoursAgo(2.4) },
      { x: 70, y: 65, timestamp: hoursAgo(2.2) },
      { x: 45, y: 70, timestamp: hoursAgo(2.1) },
      { x: 15, y: 75, timestamp: hoursAgo(2) },
    ],
    observations: [
      "Debris on fence near Gate 3 - appears to be plastic sheeting",
      "Block C perimeter intact",
      "Storage Yard B - no activity observed during flyover",
    ],
    coverageAreas: ["gate-3", "checkpoint-1", "building-warehouse", "yard-b", "block-c"],
  },
]

// Get location by ID helper
export function getLocationById(id: string): SiteLocation | undefined {
  return siteLocations.find(loc => loc.id === id)
}

// Get events by location helper
export function getEventsByLocation(locationId: string): SecurityEvent[] {
  return securityEvents.filter(evt => evt.location.id === locationId)
}

// Get related events helper
export function getRelatedEvents(eventId: string): SecurityEvent[] {
  const event = securityEvents.find(e => e.id === eventId)
  if (!event) return []
  return securityEvents.filter(e => event.relatedEventIds.includes(e.id))
}
