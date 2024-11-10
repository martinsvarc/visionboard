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
 tooltipTitle?: string;    // Add this
  tooltipSubtitle?: string; // Add this
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
  badge: Badge;
  showIndividualProgress?: boolean;
}

function BadgeGrid({ badge, showIndividualProgress }: BadgeGridProps) {
  const BadgeContent = (
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
          loading="eager"
          unoptimized
          onError={(e) => {
            console.error('Failed to load image:', badge.image);
            console.error('Error event:', e);
            e.currentTarget.src = 'https://placehold.co/40x40';
          }}
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
  );

  if (badge.unlocked) {
    return BadgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <button type="button" className="w-full">
            {BadgeContent}
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-white/80 backdrop-blur-sm border-white/20 p-1 rounded-lg shadow-lg text-xs">
          <p className="font-extrabold whitespace-nowrap">{badge.tooltipTitle}</p>
          <p className="text-slate-500 whitespace-nowrap font-medium">{badge.tooltipSubtitle}</p>
        </TooltipContent>
      </Tooltip>
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
        {badges.map((badge, index) => (
          <BadgeGrid key={index} badge={badge} showIndividualProgress={showIndividualProgress} />
        ))}
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
    { 
      days: 5, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-HWOAO1EUTGSglSzZlSFjHA-dQjZimptRd-0SpN_-6oU5w-removebg-preview_iatnoy.png", 
      description: "5 Day Streak", 
      unlocked: true,
      tooltipTitle: "Beginner's Commitment",
      tooltipSubtitle: "Sign in for 5 consecutive days"
    },
    { 
      days: 10, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-QHfb4ipTQUu1iR54Vmxo6g-RFBtanJsS0aS2a2tOFHHXg-removebg-preview_kzjyge.png", 
      description: "10 Day Streak", 
      unlocked: true,
      tooltipTitle: "Steady Progress",
      tooltipSubtitle: "Maintain a 10-day streak"
    },
    { 
      days: 30, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-CSU-cRrnTDCAuvGYTSV90w-taY5gPBoQxydiszFPNpDvQ-removebg-preview_hnqjkl.png", 
      description: "30 Day Streak", 
      unlocked: true,
      tooltipTitle: "Monthly Master",
      tooltipSubtitle: "Complete a full month of sign-ins"
    },
    { 
      days: 90, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-RCaF4tpKT7aJoICZ2L508Q-UCW5RDP4Q4KfvoRnq8NlfA-removebg-preview_tevelw.png", 
      description: "90 Day Streak", 
      unlocked: false,
      tooltipTitle: "Quarterly Champion",
      tooltipSubtitle: "Stay committed for 90 days"
    },
    { 
      days: 180, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-L5aDOKYDTgKsB2lxHimuQQ-2xr3cxz6RCeNCL9HhBtylA-removebg-preview_oooy2m.png", 
      description: "180 Day Streak", 
      unlocked: false,
      tooltipTitle: "Half-Year Hero",
      tooltipSubtitle: "Reach 180 days of dedication"
    },
    { 
      days: 365, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-9Ut5P-Z7Q-qcpgWOIlslCA-YQ3T7zHwThCVVysgv9KyEg-removebg-preview_dlplgi.png", 
      description: "365 Day Streak", 
      unlocked: false,
      tooltipTitle: "Year-Long Legend",
      tooltipSubtitle: "Complete a full year of consistency"
    }
  ];

const callsBadges: Badge[] = [
    { 
      calls: 10, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206170/WhatsApp_Image_2024-11-07_at_23.19.01_2cecae84-removebg-preview_radody.png", 
      description: "10 Calls", 
      unlocked: true,
      tooltipTitle: "First Steps",
      tooltipSubtitle: "Complete your first 10 calls"
    },
    { 
      calls: 25, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/WhatsApp_Image_2024-11-07_at_23.19.00_410bcd52-removebg-preview_bi6eon.png", 
      description: "25 Calls", 
      unlocked: true,
      tooltipTitle: "Getting Started",
      tooltipSubtitle: "Make 25 successful calls"
    },
    { 
      calls: 50, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206170/WhatsApp_Image_2024-11-07_at_23.19.00_e9686083-removebg-preview_qt9tyx.png", 
      description: "50 Calls", 
      unlocked: true,
      tooltipTitle: "Call Enthusiast",
      tooltipSubtitle: "Reach 50 calls milestone"
    },
    { 
      calls: 100, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/WhatsApp_Image_2024-11-07_at_23.18.59_aaafd20b-removebg-preview_mniysw.png", 
      description: "100 Calls", 
      unlocked: false,
      tooltipTitle: "Century Caller",
      tooltipSubtitle: "Hit your first 100 calls"
    },
    { 
      calls: 250, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/WhatsApp_Image_2024-11-07_at_23.18.58_e34cbb5f-removebg-preview_nm6c8a.png", 
      description: "250 Calls", 
      unlocked: false,
      tooltipTitle: "Call Expert",
      tooltipSubtitle: "Master 250 calls"
    },
    { 
      calls: 500, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206170/WhatsApp_Image_2024-11-07_at_23.18.59_dac37adb-removebg-preview_xfpwp9.png", 
      description: "500 Calls", 
      unlocked: false,
      tooltipTitle: "Call Virtuoso",
      tooltipSubtitle: "Achieve 500 successful calls"
    },
    { 
      calls: 750, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/WhatsApp_Image_2024-11-07_at_23.18.57_f7535a53-removebg-preview_we2xbp.png", 
      description: "750 Calls", 
      unlocked: false,
      tooltipTitle: "Elite Caller",
      tooltipSubtitle: "Join the elite with 750 calls"
    },
    { 
      calls: 1000, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/WhatsApp_Image_2024-11-07_at_23.18.57_717b1f9c-removebg-preview_yupyox.png", 
      description: "1000 Calls", 
      unlocked: false,
      tooltipTitle: "Call Master",
      tooltipSubtitle: "Reach the impressive 1000 calls"
    },
    { 
      calls: 1500, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/WhatsApp_Image_2024-11-07_at_23.18.58_44ffd513-removebg-preview_jsmszk.png", 
      description: "1500 Calls", 
      unlocked: false,
      tooltipTitle: "Call Legend",
      tooltipSubtitle: "Achieve legendary status"
    },
    { 
      calls: 2500, 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/WhatsApp_Image_2024-11-07_at_23.19.01_b4416b2f-removebg-preview_jd6136.png", 
      description: "2500 Calls", 
      unlocked: false,
      tooltipTitle: "Ultimate Caller",
      tooltipSubtitle: "Reach the pinnacle of calling"
    }
  ];

const activityBadges: Badge[] = [
    { 
      count: 10, 
      period: "day", 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/InBodPWuQrymOXROYwUwow-removebg-preview_b9fn8n.png", 
      description: "10/Day", 
      unlocked: false, 
      current: dailyActivity, 
      target: 10,
      tooltipTitle: "Daily Achiever",
      tooltipSubtitle: "Complete 10 activities in one day"
    },
    { 
      count: 50, 
      period: "week", 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/DuZdTwN_T8SRiCdUHDt-AQ-removebg-preview_1_jcg1nm.png", 
      description: "50/Week", 
      unlocked: false, 
      current: weeklyActivity, 
      target: 50,
      tooltipTitle: "Weekly Warrior",
      tooltipSubtitle: "Hit 50 activities in a week"
    },
    { 
      count: 100, 
      period: "week", 
      image: "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/N3kPQOnXZxSlHf6wHlI-dA-removebg-preview_nzthza.png", 
      description: "100/Week", 
      unlocked: false, 
      current: weeklyActivity, 
      target: 100,
      tooltipTitle: "High Performer",
      tooltipSubtitle: "Complete 100 weekly activities"
    }
  ];

const leagueBadges: Badge[] = [
    { 
      rank: "Bronze", 
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-large-radiant-bronze-medal-with-a-t0r6ItMuRVOEve22GfVYdw-KxQg20b_SdOR5Y3HVUaVZg-removebg-preview-FQvuwEgYxWGz6qrgC1TDFLJgNCqMTd.png", 
      description: "3rd place", 
      unlocked: true,
      tooltipTitle: "For Steady Hands",
      tooltipSubtitle: "3rd Place in Monthly League"
    },
    { 
      rank: "Silver", 
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-large-radiant-silver-medal-with-a-SF8CEVMrSWaKtCH-SS0KPw-xITb8y53Tw-95YbTOpEHoQ-removebg-preview-U6690RSmf0Tv9j0qzPESh3bBQJKIB4.png", 
      description: "2nd place", 
      unlocked: true,
      tooltipTitle: "For Steady Hands",
      tooltipSubtitle: "2nd Place in Monthly League"
    },
    { 
      rank: "Gold", 
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-large-radiant-gold-medal-with-a-b-T5VpM4deRuWtnNpknWeXKA-oVpwYeqBTOuOBOCRRskHXg-removebg-preview-o68fcm402jSQQlsuqIHnmTKovqR92D.png", 
      description: "1st place", 
      unlocked: false,
      tooltipTitle: "For Steady Hands",
      tooltipSubtitle: "1st Place in Monthly League"
    }
];

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
