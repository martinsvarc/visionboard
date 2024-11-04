"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

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
          className="stroke-zinc-800"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${color} transition-all duration-700 ease-out-expo`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            filter: `drop-shadow(0 0 8px ${
              color === 'stroke-yellow-500'
                ? 'rgba(234, 179, 8, 0.4)'
                : color === 'stroke-blue-500'
                ? 'rgba(59, 130, 246, 0.4)'
                : color === 'stroke-green-500'
                ? 'rgba(34, 197, 94, 0.4)'
                : 'rgba(236, 72, 153, 0.4)'
            })`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export default function Component() {
  const [monthlyCount, setMonthlyCount] = React.useState(12)
  const [totalCount, setTotalCount] = React.useState(42)
  const [todayCount, setTodayCount] = React.useState(5)
  const [weeklyCount, setWeeklyCount] = React.useState(18)
  const monthlyMax = 30
  const totalMax = 100
  const todayMax = 10
  const weeklyMax = 50

  return (
    <Card className="w-[340px] bg-black border-zinc-900 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-zinc-100">Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          <div className="grid grid-cols-2 gap-4">
            <CircularProgress value={todayCount} max={todayMax} size={140} color="stroke-green-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 drop-shadow-[0_0_3px_rgba(34,197,94,0.5)]">
                  {todayCount}
                </div>
                <div className="text-xs text-zinc-400">today</div>
              </div>
            </CircularProgress>
            <CircularProgress value={weeklyCount} max={weeklyMax} size={140} color="stroke-pink-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500 drop-shadow-[0_0_3px_rgba(236,72,153,0.5)]">
                  {weeklyCount}
                </div>
                <div className="text-xs text-zinc-400">this week</div>
              </div>
            </CircularProgress>
            <CircularProgress value={monthlyCount} max={monthlyMax} size={140} color="stroke-yellow-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500 drop-shadow-[0_0_3px_rgba(234,179,8,0.5)]">
                  {monthlyCount}
                </div>
                <div className="text-xs text-zinc-400">this month</div>
              </div>
            </CircularProgress>
            <CircularProgress value={totalCount} max={totalMax} size={140} color="stroke-blue-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]">
                  {totalCount}
                </div>
                <div className="text-xs text-zinc-400">total</div>
              </div>
            </CircularProgress>
          </div>
          <div className="flex flex-col gap-2 text-sm text-zinc-400 w-full">
            <div className="flex items-center justify-between">
              <span>Today: {todayCount} of {todayMax}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <LockIcon />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>To Unlock a New Achievement</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center justify-between">
              <span>This Week: {weeklyCount} of {weeklyMax}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <LockIcon />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>To Unlock a New Achievement</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center justify-between">
              <span>This Month: {monthlyCount} of {monthlyMax}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <LockIcon />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>To Unlock a New Achievement</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center justify-between">
              <span>Total: {totalCount} of {totalMax}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <LockIcon />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>To Unlock a New Achievement</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
