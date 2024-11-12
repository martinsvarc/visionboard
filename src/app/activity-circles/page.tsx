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
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['800'], // 800 is Extra Bold
})

interface SessionData {
  count: number
  max: number
  label: string
  color: string
  badge: string
}

function CircularProgress({ value, max, size = 220, strokeWidth = 24, children, color }: {
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
        className="w-full h-full"
        viewBox={`0 0 ${size} ${size}`}
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
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// Separate component for data fetching
function SessionsData() {
  const searchParams = useSearchParams()
  const memberId = searchParams.get('memberId')
  const [sessions, setSessions] = React.useState<Record<string, SessionData>>({
    today: { 
      count: 0, 
      max: 10, 
      label: "today", 
      color: "#546bc8",
      badge: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-bold-cartoon-style-circular-activ-i3oaOHQrRwKx278lk4RWoQ-h6mSgEB2Tq-Fvag7DJFT8w-xbLWYuw1DFwiPNDPTpEZ6uDJMyrpxh.png"
    },
    week: { 
      count: 0, 
      max: 50, 
      label: "this week", 
      color: "#50c2aa",
      badge: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-bold-cartoon-style-circular-activ-P9O01brqRQyEw_pn5wIAcw-o3h9RSCdQAaad_JdR9DQaQ-lx8FuKJv3C7YMDuffkNF8G5dRdbVz3.png"
    },
    month: { 
      count: 0, 
      max: 100, 
      label: "this month", 
      color: "#fb9851",
      badge: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-bold-cartoon-style-circular-activ-yvB3xJiPRneZPgoj6rEdmA-czNvVMXFQ8WtscglnQPjzg-FurUc2Eb19gjH5vWNZltOrWnvFn5tJ.png"
    },
    year: { 
      count: 0, 
      max: 1000, 
      label: "this year", 
      color: "#fbb351",
      badge: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-bold-cartoon-style-circular-activ-d4Jo6p6JSNumNnfKQpu27A-RqgTTUF4SyeFYVWbV6zj8A-PFvtWZvIZ4NLUoErbTfoZsFDgIg9lF.png"
    },
  })

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
            year: { ...prev.year, count: data.totalCount }
          }))
        })
        .catch(error => console.error('Error loading sessions:', error))
    }
  }, [memberId])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-16 w-full max-w-6xl px-4">
      {Object.entries(sessions).map(([key, session]) => (
        <TooltipProvider key={key}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-pointer relative group flex justify-center">
                <CircularProgress value={session.count} max={session.max} color={session.color}>
                  <div className="text-center">
                    <div className="text-6xl font-medium" style={{ color: session.color }}>
                      {session.count}
                    </div>
                    <div className="text-base text-slate-400 font-normal mt-3">{session.label}</div>
                  </div>
                </CircularProgress>
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200" style={{ backgroundColor: session.color }}></div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-white p-2 rounded-md shadow-md border border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                {session.label.charAt(0).toUpperCase() + session.label.slice(1)}: {session.count} of {session.max}
              </p>
              {session.count === session.max && (
                <div className="mt-2 text-center">
                  <Image
                    src={session.badge}
                    alt={`${key} badge`}
                    width={40}
                    height={40}
                    className="mx-auto"
                  />
                  <p className="mt-1 text-xs text-green-500 font-medium">Badge Unlocked!</p>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-transparent p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <div className="bg-[#f2f3f9] p-4 sm:p-6 md:p-8 rounded-[20px] shadow-xl w-full max-w-[1400px]">
        <Card className="w-full bg-white border-none shadow-lg rounded-[20px]">
          <CardHeader className="p-4 sm:p-6 pb-12">
            <CardTitle className={`${montserrat.className} text-[#546bc8] text-4xl font-extrabold text-center`}>
              Activity Circles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 flex items-center justify-center">
            <Suspense fallback={<div>Loading sessions...</div>}>
              <SessionsData />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}