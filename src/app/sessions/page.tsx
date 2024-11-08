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
          className="stroke-[#edeef5]"
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
    <div className="w-full h-screen bg-white flex items-center justify-center overflow-hidden">
      <Card className="w-[560px] bg-white border-none shadow-lg rounded-3xl">
        <CardHeader className="text-left pb-2 pt-8 px-8">
          <CardTitle className="text-[#546bc8] text-2xl font-medium">Activity</CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-2 gap-12">
              {Object.entries(sessions).map(([key, session]) => (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger className="cursor-pointer">
                      <CircularProgress value={session.count} max={session.max} size={160} strokeWidth={10} color={session.color}>
                        <div className="text-center">
                          <div className="text-4xl font-semibold" style={{ color: session.color }}>
                            {session.count}
                          </div>
                          <div className="text-sm text-slate-400 font-medium mt-1">{session.label}</div>
                        </div>
                      </CircularProgress>
                    </TooltipTrigger>
                    <TooltipContent className="text-center">
                      <div>
                        <p className="font-medium">{session.label.charAt(0).toUpperCase() + session.label.slice(1)}</p>
                        <p>{session.count} of {session.max}</p>
                        {session.count === session.max && (
                          <div className="mt-2">
                            <Image
                              src={session.badge}
                              alt={`${key} badge`}
                              width={40}
                              height={40}
                              className="mx-auto"
                            />
                            <p className="mt-1 text-green-500">Badge Unlocked!</p>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
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
