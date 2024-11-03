"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Component() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  
  const streakData = React.useMemo(() => {
    const today = new Date()
    const currentStreak = 5 // This would be calculated based on actual user data
    const longestStreak = 7 // This would be stored and updated based on user history
    const activeDates = [] as string[]

    // Generate active dates for the current streak
    for (let i = 0; i < currentStreak; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
      activeDates.push(date.toISOString().split('T')[0])
    }

    return {
      current: currentStreak,
      longest: longestStreak,
      activeDates
    }
  }, [currentMonth])

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isToday = (date: number) => {
    const today = new Date()
    return (
      date === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const getDateStatus = (date: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    if (streakData.activeDates.includes(dateStr)) {
      return streakData.current >= streakData.longest ? 'longest' : 'current'
    }
    return 'inactive'
  }

  const calculateConsistency = () => {
    const today = new Date()
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), today.getDate())
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const daysToDate = Math.floor((currentDate.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const activeDaysThisMonth = streakData.activeDates.filter(date => {
      const activeDate = new Date(date)
      return activeDate >= startOfMonth && activeDate <= currentDate
    }).length

    return Math.round((activeDaysThisMonth / daysToDate) * 100)
  }

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const weeks = []
  let week = []
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    week.push(null)
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null)
    }
    weeks.push(week)
  }

  return (
    <Card className="flex-1 min-w-[350px] bg-black border-zinc-900 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-zinc-100">Calendar & Streak</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between gap-2 mb-4">
          <Button className="h-[72px] flex-1 bg-opacity-20 bg-blue-500 backdrop-blur-md backdrop-filter border border-white/10 hover:bg-opacity-30 text-white rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            <div className="w-full flex flex-col items-center">
              <p className="text-xs font-medium text-blue-200">Current</p>
              <p className="text-3xl font-bold mt-auto mb-auto text-blue-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                {streakData.current}
              </p>
            </div>
          </Button>
          <Button className="h-[72px] flex-[1.5] bg-opacity-20 bg-orange-500 backdrop-blur-md backdrop-filter border border-white/10 hover:bg-opacity-30 text-white rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            <div className="w-full flex flex-col items-center">
              <p className="text-xs font-medium text-orange-200">
                Consistency in {currentMonth.toLocaleString('default', { month: 'long' })}
              </p>
              <p className="text-3xl font-bold mt-auto mb-auto text-orange-300 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                {calculateConsistency()}%
              </p>
            </div>
          </Button>
          <Button className="h-[72px] flex-1 bg-opacity-20 bg-emerald-500 backdrop-blur-md backdrop-filter border border-white/10 hover:bg-opacity-30 text-white rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            <div className="w-full flex flex-col items-center">
              <p className="text-xs font-medium text-emerald-200">Longest</p>
              <p className="text-3xl font-bold mt-auto mb-auto text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                {streakData.longest}
              </p>
            </div>
          </Button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
            onClick={prevMonth}
          >
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </Button>
          <div className="text-sm font-medium text-zinc-100">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
            onClick={nextMonth}
          >
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {days.map((day) => (
            <div key={day} className="text-xs font-medium text-zinc-400">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                 className={cn(
  "aspect-square flex items-center justify-center text-sm relative",
  {
    "text-zinc-400": day && getDateStatus(day) === 'inactive',
    "bg-opacity-30 backdrop-blur-md backdrop-filter border border-white/10 text-white font-medium rounded-md": day && getDateStatus(day) === 'current',
    "bg-opacity-30 backdrop-blur-md backdrop-filter border border-white/10 text-white font-medium rounded-md": day && getDateStatus(day) === 'longest',
    "": !day,
  }
)}
                >
                  {day && (
                    <>
                      {isToday(day) && (
                        <div className="absolute inset-0 border border-zinc-400 rounded-md" />
                      )}
                      <span className={cn({
                        "text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]": getDateStatus(day) === 'current',
                        "text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]": getDateStatus(day) === 'longest',
                      })}>
                        {day}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
