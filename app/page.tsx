"use client"

import { useState, useCallback } from "react"
import { Header } from "@/components/header"
import { SiteMap } from "@/components/site-map"
import { EventCard } from "@/components/event-card"
import { EventTimeline } from "@/components/event-timeline"
import { InvestigationPanel } from "@/components/investigation-panel"
import { BriefingPanel } from "@/components/briefing-panel"
import { DronePanel } from "@/components/drone-panel"
import { ToolsRegistry } from "@/components/tools-registry"
import { securityEvents as initialEvents } from "@/lib/mock-data"
import { investigateAllEvents } from "@/lib/agent"
import type { SecurityEvent, AIAnalysis, ToolCall, SiteLocation } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  // State
  const [events, setEvents] = useState<SecurityEvent[]>(initialEvents)
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>()
  const [analyses, setAnalyses] = useState<Map<string, { analysis: AIAnalysis; toolCalls: ToolCall[] }>>(new Map())
  const [isInvestigating, setIsInvestigating] = useState(false)
  const [investigationProgress, setInvestigationProgress] = useState({ current: 0, total: 0, currentEvent: undefined as SecurityEvent | undefined })
  const [showDronePatrol, setShowDronePatrol] = useState(false)
  const [activePanel, setActivePanel] = useState<"events" | "investigation" | "briefing" | "tools">("events")

  // Get selected event
  const selectedEvent = events.find((e) => e.id === selectedEventId)

  // Handle event status change
  const handleStatusChange = useCallback((eventId: string, status: SecurityEvent["status"]) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status } : e))
    )
  }, [])

  // Handle investigation
  const handleStartInvestigation = useCallback(async () => {
    const pendingEvents = events.filter((e) => e.status === "pending")
    if (pendingEvents.length === 0) return

    setIsInvestigating(true)
    setInvestigationProgress({ current: 0, total: pendingEvents.length, currentEvent: undefined })

    const results = await investigateAllEvents(pendingEvents, (current, total, currentEvent) => {
      setInvestigationProgress({ current, total, currentEvent })
    })

    setAnalyses(results)
    setIsInvestigating(false)
    setActivePanel("investigation")
  }, [events])

  // Handle location click on map
  const handleLocationClick = useCallback((location: SiteLocation) => {
    const locationEvents = events.filter((e) => e.location.id === location.id)
    if (locationEvents.length > 0) {
      setSelectedEventId(locationEvents[0].id)
      setActivePanel("events")
    }
  }, [events])

  // Handle drone mission request
  const handleRequestMission = useCallback((locationId: string) => {
    // In a real app, this would dispatch a drone mission
    console.log("[v0] Requesting drone mission to:", locationId)
    setShowDronePatrol(true)
  }, [])

  // Get highlighted locations based on selected event
  const highlightedLocations = selectedEvent
    ? events
        .filter((e) => selectedEvent.relatedEventIds.includes(e.id))
        .map((e) => e.location.id)
    : []

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Event Timeline */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Overnight Events
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {events.length} events • {events.filter((e) => e.status === "pending").length} pending
            </p>
          </div>

          <ScrollArea className="flex-1 p-2">
            <EventTimeline
              events={events}
              selectedEventId={selectedEventId}
              onSelectEvent={setSelectedEventId}
            />
          </ScrollArea>

          {/* Quick Stats */}
          <div className="p-4 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-red-400">
                  {events.filter((e) => e.severity === "high" || e.severity === "critical").length}
                </div>
                <div className="text-xs text-slate-500">High Priority</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-emerald-400">
                  {events.filter((e) => e.status === "resolved").length}
                </div>
                <div className="text-xs text-slate-500">Resolved</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center - Map */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <SiteMap
              events={events}
              selectedEventId={selectedEventId}
              onLocationClick={handleLocationClick}
              showDronePatrol={showDronePatrol}
              highlightedLocations={highlightedLocations}
            />
          </div>

          {/* Selected Event Detail */}
          {selectedEvent && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <EventCard
                event={selectedEvent}
                analysis={analyses.get(selectedEvent.id)?.analysis}
                toolCalls={analyses.get(selectedEvent.id)?.toolCalls}
                isSelected={true}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}
        </main>

        {/* Right Sidebar - Control Panels */}
        <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col">
          <Tabs value={activePanel} onValueChange={(v) => setActivePanel(v as typeof activePanel)} className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4 bg-slate-800/50">
              <TabsTrigger value="events" className="flex-1 data-[state=active]:bg-slate-700">
                Events
              </TabsTrigger>
              <TabsTrigger value="investigation" className="flex-1 data-[state=active]:bg-slate-700">
                AI
              </TabsTrigger>
              <TabsTrigger value="briefing" className="flex-1 data-[state=active]:bg-slate-700">
                Briefing
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex-1 data-[state=active]:bg-slate-700">
                Tools
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="events" className="p-4 space-y-4 mt-0">
                <DronePanel
                  showPatrol={showDronePatrol}
                  onTogglePatrol={() => setShowDronePatrol(!showDronePatrol)}
                  onRequestMission={handleRequestMission}
                />
              </TabsContent>

              <TabsContent value="investigation" className="p-4 space-y-4 mt-0">
                <InvestigationPanel
                  events={events}
                  analyses={analyses}
                  isInvestigating={isInvestigating}
                  progress={investigationProgress}
                  onStartInvestigation={handleStartInvestigation}
                />
              </TabsContent>

              <TabsContent value="briefing" className="p-4 space-y-4 mt-0">
                <BriefingPanel
                  events={events}
                  analyses={analyses}
                  onExport={() => console.log("[v0] Export briefing")}
                />
              </TabsContent>

              <TabsContent value="tools" className="p-4 space-y-4 mt-0">
                <ToolsRegistry />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </aside>
      </div>
    </div>
  )
}
