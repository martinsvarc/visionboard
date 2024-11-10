"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

// Define interfaces for our props and badges
interface Badge {
  days?: number;
  calls?: number;
  count?: number;
  period?: string;
  rank?: string;
  image: string;
  description: string;
  unlocked: boolean;
  current?: number;
  target?: number;
}

interface CategorySectionProps {
  title: string;
  currentStreak?: number;
  nextMilestone?: number;
  progress?: number;
  badges: Badge[];
  description?: string;
  showIndividualProgress?: boolean;
}

interface BadgeGridProps {
  badges: Badge[];
  showIndividualProgress?: boolean;
}

function BadgeGrid({ badges, showIndividualProgress }: BadgeGridProps) {
  return (
    <TooltipProvider>
      {badges.map((badge, index) => (
        <Tooltip key={index}>
          <TooltipTrigger>
            <div className="space-y-1">
              <div className={`relative transition-all duration-300 hover:scale-110 ${
                  !badge.unlocked ? "opacity-50 grayscale" : ""
                }`}
              >
                <Image
                  src={badge.image}
                  alt={badge.description}
                  width={40}
                  height={40}
                  className="relative object-contain drop-shadow-md"
                />
                {!badge.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-full p-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-slate-400"
                      >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              {showIndividualProgress && badge.current !== undefined && badge.target !== undefined && (
                <Progress 
                  value={(badge.current / badge.target) * 100} 
                  className="h-0.5 w-full bg-white/50 [&>div]:bg-[#51c1a9]" 
                />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-white/80 backdrop-blur-sm border-white/20 p-1 rounded-lg shadow-lg text-xs">
            <p className="font-extrabold whitespace-nowrap">
              {badge.unlocked 
                ? badge.description 
                : badge.period
                  ? `Complete ${badge.target! - badge.current!} more activities this ${badge.period}`
                  : badge.rank
                    ? `Reach ${badge.rank} League`
                    : badge.days
                      ? `Next: ${badge.days} Day Streak`
                      : badge.calls
                        ? `Next: ${badge.calls} Calls`
                        : 'Locked'
              }
            </p>
            {!badge.unlocked && (
              <p className="text-slate-500 whitespace-nowrap font-medium">
                {badge.days 
                  ? "Keep signing in!" 
                  : badge.calls 
                    ? "Complete more calls!" 
                    : badge.rank
                      ? "Climb the ranks!"
                      : "Keep going!"}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      ))}
    </TooltipProvider>
  )
}

function CategorySection({ title, currentStreak, nextMilestone, progress, badges, description, showIndividualProgress }: CategorySectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-extrabold text-[#556bc7]">{title}</h3>
      {(currentStreak !== undefined && nextMilestone !== undefined) && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-600">
            <span className="font-medium">Current: {currentStreak} {currentStreak === 1 ? 'day' : 'days'}</span>
            <span>Next: {nextMilestone} days</span>
          </div>
          <Progress 
            value={progress} 
            className="h-1 bg-white/50 [&>div]:bg-[#51c1a9]" 
          />
        </div>
      )}
      {description && (
        <p className="text-xs text-slate-600">{description}</p>
      )}
      <div className="grid grid-cols-5 gap-1">
        <BadgeGrid badges={badges} showIndividualProgress={showIndividualProgress} />
      </div>
    </div>
  )
}

export default function Component() {
  const [signInStreak, setSignInStreak] = useState(45)
  const [completedCalls, setCompletedCalls] = useState(85)
  const [dailyActivity, setDailyActivity] = useState(8)
  const [weeklyActivity, setWeeklyActivity] = useState(35)
  const [monthlyActivity, setMonthlyActivity] = useState(75)
  const [currentLeagueRank, setCurrentLeagueRank] = useState("Silver")

const signInBadges: Badge[] = [
    { days: 5, image: "https://i.ibb.co/D997gfg/110.jpg", description: "5 Day Streak", unlocked: true },
    { days: 10, image: "https://i.ibb.co/p2vdRTL/117.jpg", description: "10 Day Streak", unlocked: true },
    { days: 30, image: "https://i.ibb.co/t3MDw4p/116.jpg", description: "30 Day Streak", unlocked: true },
    { days: 90, image: "https://i.ibb.co/hYFqxvL/115.jpg", description: "90 Day Streak", unlocked: false },
    { days: 180, image: "https://i.ibb.co/t8ScZ7S/114.jpg", description: "180 Day Streak", unlocked: false },
    { days: 365, image: "https://i.ibb.co/C5gXJbt/113.jpg", description: "365 Day Streak", unlocked: false }
  ]

  const callsBadges: Badge[] = [
    { calls: 10, image: "https://i.ibb.co/GMm73Rn/101.jpg", description: "10 Calls", unlocked: true },
    { calls: 25, image: "https://i.ibb.co/7S73sNv/112.jpg", description: "25 Calls", unlocked: true },
    { calls: 50, image: "https://i.ibb.co/HPrvgmc/111.jpg", description: "50 Calls", unlocked: true },
    { calls: 100, image: "https://i.ibb.co/crJwybZ/109.jpg", description: "100 Calls", unlocked: false },
    { calls: 250, image: "https://i.ibb.co/8jn8084/108.jpg", description: "250 Calls", unlocked: false },
    { calls: 500, image: "https://i.ibb.co/mttB3xC/107.jpg", description: "500 Calls", unlocked: false },
    { calls: 750, image: "https://i.ibb.co/tm6ZYmB/106.jpg", description: "750 Calls", unlocked: false },
    { calls: 1000, image: "https://i.ibb.co/JpywNtj/105.jpg", description: "1000 Calls", unlocked: false },
    { calls: 1500, image: "https://i.ibb.co/n3zNLQq/104.jpg", description: "1500 Calls", unlocked: false },
    { calls: 2500, image: "https://i.ibb.co/q5jS9np/113.jpg", description: "2500 Calls", unlocked: false }
  ]

    const activityBadges: Badge[] = [
    { count: 10, period: "day", image: "https://i.ibb.co/80wpvxh/103.jpg", description: "10/Day", unlocked: false, current: dailyActivity, target: 10 },
    { count: 50, period: "week", image: "https://i.ibb.co/YBDXdFP/102.jpg", description: "50/Week", unlocked: false, current: weeklyActivity, target: 50 },
    { count: 100, period: "month", image: "https://i.ibb.co/GMm73Rn/101.jpg", description: "100/Month", unlocked: false, current: monthlyActivity, target: 100 }
  ]

  const leagueBadges: Badge[] = [
    { rank: "Bronze", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-large-radiant-bronze-medal-with-a-t0r6ItMuRVOEve22GfVYdw-KxQg20b_SdOR5Y3HVUaVZg-removebg-preview-FQvuwEgYxWGz6qrgC1TDFLJgNCqMTd.png", description: "3rd place", unlocked: true },
    { rank: "Silver", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-large-radiant-silver-medal-with-a-SF8CEVMrSWaKtCH-SS0KPw-xITb8y53Tw-95YbTOpEHoQ-removebg-preview-U6690RSmf0Tv9j0qzPESh3bBQJKIB4.png", description: "2nd place", unlocked: true },
    { rank: "Gold", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-large-radiant-gold-medal-with-a-b-T5VpM4deRuWtnNpknWeXKA-oVpwYeqBTOuOBOCRRskHXg-removebg-preview-o68fcm402jSQQlsuqIHnmTKovqR92D.png", description: "Reach the 1st place in league", unlocked: false }
  ]

  return (
    <div className={`${montserrat.variable} font-sans bg-white min-h-screen flex items-center justify-center p-4`}>
      <div className="bg-[#f2f3f9] p-6 rounded-xl shadow-lg max-w-md w-full">
        <Card className="w-full overflow-hidden bg-white border-white/20 shadow-sm">
          <CardHeader className="border-b border-white/20 p-3">
            <CardTitle className="text-lg font-extrabold text-[#556bc7]">
              Achievement Showcase
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-4">
              <CategorySection
                title="Sign-in Streaks"
                currentStreak={signInStreak}
                nextMilestone={90}
                progress={(signInStreak / 90) * 100}
                badges={signInBadges}
              />
              <CategorySection
                title="Completed Calls"
                currentStreak={completedCalls}
                nextMilestone={100}
                progress={(completedCalls / 100) * 100}
                badges={callsBadges}
              />
              <CategorySection
                title="Activity Goals"
                description="Daily, Weekly, Monthly"
                badges={activityBadges}
                showIndividualProgress
              />
              <CategorySection
                title="League Places"
                description={`Current League: ${currentLeagueRank}`}
                badges={leagueBadges}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
