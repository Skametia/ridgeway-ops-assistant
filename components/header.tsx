"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  userName?: string
}

export function Header({ userName = "Maya" }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Calculate time until 8 AM briefing
  const getTimeUntilBriefing = () => {
    const now = new Date()
    const briefingTime = new Date()
    briefingTime.setHours(8, 0, 0, 0)

    if (now >= briefingTime) {
      return "Briefing time passed"
    }

    const diff = briefingTime.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m until briefing`
    }
    return `${minutes}m until briefing`
  }

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">6:10 Assistant</h1>
              <p className="text-xs text-slate-400">Ridgeway Site Operations</p>
            </div>
          </div>
        </div>

        {/* Center - Time display */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-white tracking-wider">
            {formatTime(currentTime)}
          </div>
          <div className="text-xs text-slate-500">{formatDate(currentTime)}</div>
        </div>

        {/* Right side - User info and briefing countdown */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <Badge variant="outline" className="text-amber-400 border-amber-400/30 bg-amber-400/10">
              {getTimeUntilBriefing()}
            </Badge>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white">{userName}</div>
              <div className="text-xs text-slate-400">Operations Lead</div>
            </div>
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
