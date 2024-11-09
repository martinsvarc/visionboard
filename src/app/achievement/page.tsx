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
          <TooltipTrigger asChild>
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
          <TooltipContent 
            side="top" 
            align="center" 
            className="bg-white/80 backdrop-blur-sm border-white/20 p-1 rounded-lg shadow-lg z-[9999] text-xs"
            sideOffset={5}
          >
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
    { days: 5, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-HWOAO1EUTGSglSzZlSFjHA-dQjZimptRd-0SpN_-6oU5w-removebg-preview-kqCdBji4NtHiKw4VNgVdM4AvaoJTeG.png", description: "5 Day Streak", unlocked: true },
    { days: 10, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-QHfb4ipTQUu1iR54Vmxo6g-RFBtanJsS0aS2a2tOFHHXg-removebg-preview-v7ErIfzS4KWNaGOsrDHAlKE567RPBl.png", description: "10 Day Streak", unlocked: true },
    { days: 30, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-CSU-cRrnTDCAuvGYTSV90w-taY5gPBoQxydiszFPNpDvQ-removebg-preview-icmW2h12SQM5AuIhCFGS6QgVtHH4bl.png", description: "30 Day Streak", unlocked: true },
    { days: 90, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-RCaF4tpKT7aJoICZ2L508Q-UCW5RDP4Q4KfvoRnq8NlfA-removebg-preview-uTOgO6F3TcAT7mgifJaah0IMdp7aBL.png", description: "90 Day Streak", unlocked: false },
    { days: 180, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-L5aDOKYDTgKsB2lxHimuQQ-2xr3cxz6RCeNCL9HhBtylA-removebg-preview-EjyMwQ76jCkYGHpc22uRIkJ4b0c6gu.png", description: "180 Day Streak", unlocked: false },
    { days: 365, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-9Ut5P-Z7Q-qcpgWOIlslCA-YQ3T7zHwThCVVysgv9KyEg-removebg-preview-6Gy0yI5Pl0pFnfMYafKQCjqqmtUVEL.png", description: "365 Day Streak", unlocked: false }
  ]

  const callsBadges: Badge[] = [
    { calls: 10, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.19.01_2cecae84-removebg-preview-HpwJXY8H5IMISoTv4km3ojTHoSZR8l.png", description: "10 Calls", unlocked: true },
    { calls: 25, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.19.00_410bcd52-removebg-preview-dlLwx4QulGYXIPJ1SngulFRrwEzsAK.png", description: "25 Calls", unlocked: true },
    { calls: 50, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.19.00_e9686083-removebg-preview-MDIRXQ0AssJavrWhCOpsWNpEU5d4Ju.png", description: "50 Calls", unlocked: true },
    { calls: 100, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.59_aaafd20b-removebg-preview-XjPy3hlhfslMzznTbnidnUwXshcQfA.png", description: "100 Calls", unlocked: false },
    { calls: 250, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.58_e34cbb5f-removebg-preview-a9uNWRXCjGbpOHLSqf3TpeOCzxTRd7.png", description: "250 Calls", unlocked: false },
    { calls: 500, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.59_dac37adb-removebg-preview-hJMSixcu6MZEXimLJmrsyO2temyFDg.png", description: "500 Calls", unlocked: false },
    { calls: 750, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.57_f7535a53-removebg-preview-Vr88OikuiRNF7hIVXzXNPrsJFX1mpv.png", description: "750 Calls", unlocked: false },
    { calls: 1000, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.57_717b1f9c-removebg-preview-NEfGEVDhw3AK6EJSo0gtm42sq28oy2.png", description: "1000 Calls", unlocked: false },
    { calls: 1500, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.58_44ffd513-removebg-preview-3KJg104tTgbQo53R75ZJIdE4Pv6jBi.png", description: "1500 Calls", unlocked: false },
    { calls: 2500, image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.19.01_b4416b2f-removebg-preview-wl3Pqdmr7gt9BFVpspJ0ggm41XedWZ.png", description: "2500 Calls", unlocked: false }
  ]

  const activityBadges: Badge[] = [
    { count: 10, period: "day", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/InBodPWuQrymOXROYwUwow-removebg-preview-IEGWv6kNCTAusDQjfDnJXpHoQRgFQR.png", description: "10/Day", unlocked: false, current: dailyActivity, target: 10 },
    { count: 50, period: "week", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DuZdTwN_T8SRiCdUHDt-AQ-removebg-preview%20(1)-7g7ItwNB5ISjQHja5mcpjzxc8hr0s7.png", description: "50/Week", unlocked: false, current: weeklyActivity, target: 50 },
    { count: 100, period: "month", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/73z7d5wLQiyhufwfTdw5OA-removebg-preview%20(1)-5AC5dKLPkTLUI9LEOfALqI2ksNMNzd.png", description: "100/Month", unlocked: false, current: monthlyActivity, target: 100 }
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
