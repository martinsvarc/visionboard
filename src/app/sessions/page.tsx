"use client"

import * as React from "react"
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Lock, Unlock } from "lucide-react"
import Image from "next/image"

interface SessionData {
  count: number
  max: number
  label: string
  color: string
  badge: string
}

function CircularProgress({ value, max, size = 120, strokeWidth = 12, children, color }: {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  children?: React.ReactNode
  color: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / max) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        style={{ width: size, height: size }}
      >
        <circle
          className="stroke-[#f2f3f9]"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          className="transition-all duration-700 ease-out-expo"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

function SessionsComponent() {
  const [sessions, setSessions] = React.useState<Record<string, SessionData>>({
    today: { 
      count: 0, 
      max: 10, 
      label: "today", 
      color: "#546bc8",
      badge: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bronze-badge-OViNeupnapYUCtB5vwzJVMdZuGuBV5.svg"
    },
    week: { 
      count: 0, 
      max: 50, 
      label: "this week", 
      color: "#50c2aa",
      badge: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/silver-badge-enVkwENGFRkFzSnZhPx1Ou3Vny1Ydi.svg"
    },
    month: { 
      count: 0, 
      max: 30, 
      label: "this month", 
      color: "#fb9851",
      badge: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gold-badge-riUne9cvOoQqD1jkSdP6BpoVbJI58A.svg"
    },
    total: { 
      count: 0, 
      max: 100, 
      label: "total", 
      color: "#fbb351",
      badge: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/diamond-badge-NBii8nLIX5QheqCHQgHbZvTPXiH4hu.svg"
    },
  })

  const searchParams = useSearchParams()
  const memberId = searchParams.get('memberId')

  // Load session data
  React.useEffect(() => {
    if (memberId) {
      console.log('Loading sessions for member:', memberId)
      fetch(`/api/track-sessions?memberId=${memberId}`)
        .then(response => response.json())
        .then(data => {
          console.log('Session data:', data)
          setSessions(prev => ({
            ...prev,
            today: { ...prev.today, count: data.todayCount },
            week: { ...prev.week, count: data.weeklyCount },
            month: { ...prev.month, count: data.monthlyCount },
            total: { ...prev.total, count: data.totalCount }
          }))
        })
        .catch(error => console.error('Error loading sessions:', error))
    }
  }, [memberId])

  return (
    <div className="min-h-screen w-full bg-transparent p-8 flex items-center justify-center">
      <div className="bg-[#f2f3f9] p-6 rounded-3xl shadow-xl">
        <Card className="w-full max-w-[380px] bg-white border-none shadow-lg rounded-2xl">
          <CardHeader className="text-left pb-2">
            <CardTitle className="text-[#546bc8] text-2xl font-medium">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-8">
              <div className="grid grid-cols-2 gap-8">
                {Object.entries(sessions).map(([key, session]) => (
                  <CircularProgress key={key} value={session.count} max={session.max} size={140} color={session.color}>
                    <div className="text-center">
                      <div className="text-4xl font-semibold" style={{ color: session.color }}>
                        {session.count}
                      </div>
                      <div className="text-sm text-slate-400 font-medium mt-1">{session.label}</div>
                    </div>
                  </CircularProgress>
                ))}
              </div>
              <div className="flex flex-col gap-3 text-sm w-full">
                {Object.entries(sessions).map(([key, session]) => (
                  <div 
                    key={key} 
                    className="flex items-center justify-between rounded-full py-4 px-6" 
                    style={{ backgroundColor: session.color }}
                  >
                    <span className="font-medium text-white text-lg">
                      {session.label.charAt(0).toUpperCase() + session.label.slice(1)}: {session.count} of {session.max}
                    </span>
                    <div className="flex items-center gap-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-white hover:bg-white/10 relative group overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                              <div className={`absolute inset-1 transition-opacity ${session.count === session.max ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <Image
                                  src={session.badge}
                                  alt={`${key} badge`}
                                  width={24}
                                  height={24}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              {session.count === session.max ? (
                                <Unlock className="w-5 h-5 text-green-500 absolute" />
                              ) : (
                                <Lock className="w-5 h-5 group-hover:opacity-0 transition-opacity absolute" />
                              )}
                              <span className="sr-only">Achievement info</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {session.count === session.max ? (
                              <p>{key.charAt(0).toUpperCase() + key.slice(1)} achievement badge unlocked!</p>
                            ) : (
                              <p>Unlock {key} achievement badge!</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SessionsComponent />
    </Suspense>
  )
}
