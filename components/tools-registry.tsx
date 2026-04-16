"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAvailableTools } from "@/lib/agent"

export function ToolsRegistry() {
  const tools = getAvailableTools()

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          MCP Tools Registry
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-xs text-slate-400">
          These tools are available to the AI agent for investigating security events.
        </p>

        <div className="space-y-2">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="bg-slate-900/50 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-emerald-400">{tool.name}</span>
                <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                  {Object.keys(tool.parameters).length} params
                </Badge>
              </div>
              <p className="text-xs text-slate-400">{tool.description}</p>
              
              {/* Parameters */}
              <div className="pt-2 border-t border-slate-700">
                <span className="text-xs text-slate-500 font-medium">Parameters:</span>
                <div className="mt-1 space-y-1">
                  {Object.entries(tool.parameters).map(([name, param]) => (
                    <div key={name} className="flex items-start gap-2 text-xs">
                      <code className="text-blue-400 bg-slate-800 px-1 rounded">
                        {name}
                      </code>
                      <span className="text-slate-500">({param.type})</span>
                      {param.required && (
                        <span className="text-red-400">*</span>
                      )}
                      <span className="text-slate-400 flex-1">{param.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Tools follow MCP (Model Context Protocol) interface pattern</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
