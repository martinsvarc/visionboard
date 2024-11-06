"use client"

import * as React from "react"
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSearchParams } from 'next/navigation'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

function CalendarComponent() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [streakData, setStreakData] = React.useState({
    current: 0,
    longest: 0,
    activeDates: [] as string[]
  });

  const searchParams = useSearchParams();
  const memberId = searchParams.get('memberId');

  // Keep your existing data fetching
  React.useEffect(() => {
    if (memberId) {
      fetch(`/api/track-streak?memberId=${memberId}`)
        .then(response => response.json())
        .then(data => {
          setStreakData({
            current: data.currentStreak || 0,
            longest: data.longestStreak || 0,
            activeDates: data.activeDates || []
          });
        })
        .catch(error => console.error('Error loading streak data:', error));
    }
  }, [memberId, currentMonth]);

  // Keep all your existing calendar logic
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
      return streakData.current >= streakData.longest ? 'currentStreak' : 'previousStreak'
    }
    return 'inactive'
  }

  const calculateConsistency = () => {
    const today = new Date()
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), today.getDate())
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    
    const daysToDate = Math.min(
        today.getDate(),
        Math.floor((currentDate.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    const activeDaysThisMonth = streakData.activeDates.filter(date => {
        const activeDate = new Date(date)
        return activeDate.getMonth() === currentMonth.getMonth() &&
               activeDate.getFullYear() === currentMonth.getFullYear() &&
               activeDate <= today;
    }).length;

    return Math.round((activeDaysThisMonth / daysToDate) * 100);
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
    <div className={`min-h-screen w-full bg-white p-4 flex items-center justify-center ${montserrat.variable} font-sans`}>
      <div className="bg-[#f2f3f9] p-6 rounded-[32px] shadow-lg">
        <Card className="flex-1 min-w-[350px] max-w-xl bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[24px]">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-extrabold text-[#556bc7]">Calendar & Streak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between gap-2 mb-4">
              <Button className="h-[72px] flex-1 bg-[#556bc7] hover:bg-[#4a5eb3] text-white rounded-2xl shadow-lg transition-all duration-300">
                <div className="w-full flex flex-col items-center">
                  <p className="text-xs font-medium text-white/80">Current</p>
                  <p className="text-3xl font-extrabold mt-auto mb-auto text-white">
                    {streakData.current}
                  </p>
                </div>
              </Button>
              <Button className="h-[72px] flex-[1.5] bg-[#51c1a9] hover:bg-[#48ad97] text-white rounded-2xl shadow-lg transition-all duration-300">
                <div className="w-full flex flex-col items-center">
                  <p className="text-xs font-medium text-white/80">
                    Consistency in {currentMonth.toLocaleString('default', { month: 'long' })}
                  </p>
                  <p className="text-3xl font-extrabold mt-auto mb-auto text-white">
                    {calculateConsistency()}%
                  </p>
                </div>
              </Button>
              <Button className="h-[72px] flex-1 bg-[#fbb350] hover:bg-[#faa638] text-white rounded-2xl shadow-lg transition-all duration-300">
                <div className="w-full flex flex-col items-center">
                  <p className="text-xs font-medium text-white/80">Longest</p>
                  <p className="text-3xl font-extrabold mt-auto mb-auto text-white">
                    {streakData.longest}
                  </p>
                </div>
              </Button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
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
              <div className="text-sm font-extrabold text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
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
                <div key={day} className="text-xs font-medium text-gray-500">
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
                          "text-gray-400": day && getDateStatus(day) === 'inactive',
                          "border-2 border-[#556bc7] text-[#556bc7] font-extrabold rounded-xl": isToday(day),
                          "bg-[#51c1a9] border-2 border-[#51c1a9] text-white font-extrabold rounded-xl shadow-md": day && getDateStatus(day) === 'currentStreak',
                          "bg-[#fbb350] text-white font-medium rounded-xl shadow-sm": day && getDateStatus(day) === 'previousStreak',
                          "": !day,
                        }
                      )}
                    >
                      {day && (
                        <span>
                          {day}
                        </span>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}
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
      <CalendarComponent />
    </Suspense>
  );
}
