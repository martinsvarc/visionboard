'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, ArrowRight, RefreshCcw, TrendingUp, Palette, Calendar, Clock, Upload, X, Lock } from 'lucide-react'
import { cn } from "@/lib/utils"

interface LeaguePlayer {
  rank: number
  name: string
  points: number
  avatar: string
  badge?: string
}

interface ActivityCircle {
  value: number
  label: string
  progress: number
  color: string
  icon: 'clock' | 'calendar'
  max: number
}

interface Achievement {
  name: string
  progress: number
  badge?: string
  locked?: boolean
}

interface VisionItem {
  id: string
  src: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  aspectRatio: number
}

const UploadIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const PaletteIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="7" r="1" />
    <circle cx="17" cy="12" r="1" />
    <circle cx="7" cy="12" r="1" />
    <circle cx="12" cy="17" r="1" />
    <path d="M3 12h4m10 0h4M12 3v4m0 10v4" />
  </svg>
)

const TrashIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM7 3h10M9 3v3M15 3v3M9 14v-4M15 14v-4" />
  </svg>
)

function ColorPicker({ color, onChange }: { color: string, onChange: (color: string) => void }) {
  const [hue, setHue] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const pickerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      setPosition({ x, y })
      const newColor = `hsl(${hue}, ${x * 100}%, ${100 - y * 100}%)`
      onChange(newColor)
    }
  }

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value)
    setHue(newHue)
    const newColor = `hsl(${newHue}, ${position.x * 100}%, ${100 - position.y * 100}%)`
    onChange(newColor)
  }

  return (
    <div className="p-4 w-64 space-y-4">
      <div
        ref={pickerRef}
        className="w-full h-40 rounded-lg cursor-crosshair relative"
        style={{
          background: `linear-gradient(to bottom, white, transparent),
                      linear-gradient(to right, transparent, hsl(${hue}, 100%, 50%))`,
          backgroundColor: 'black'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => e.buttons === 1 && handleMouseDown(e)}
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-white absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`,
            backgroundColor: color
          }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="360"
        value={hue}
        onChange={handleHueChange}
        className="color-slider w-full h-3 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )
}

function League({ activeCategory, leagueData, setActiveLeagueCategory }: { activeCategory: string, leagueData: Record<string, LeaguePlayer[]>, setActiveLeagueCategory: (category: 'weekly' | 'allTime' | 'allTimeTeam') => void }) {
  return (
    <Card className="p-3 bg-white rounded-[20px] shadow-lg h-full">
      <h2 className="text-2xl font-semibold text-[#556bc7] mb-4">League</h2>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          onClick={() => setActiveLeagueCategory('weekly')}
          className={cn(
            "flex-1 px-4 py-2 text-base font-medium transition-colors rounded-full",
            activeCategory === 'weekly' 
              ? "bg-[#fbb350] text-white hover:bg-[#fbb350]/90" 
              : "bg-transparent text-gray-500 hover:bg-gray-100"
          )}
        >
          Weekly League
        </Button>
        <Button 
          onClick={() => setActiveLeagueCategory('allTime')}
          className={cn(
            "flex-1 px-4 py-2 text-base font-medium transition-colors rounded-full",
            activeCategory === 'allTime' 
              ? "bg-[#fbb350] text-white hover:bg-[#fbb350]/90" 
              : "bg-transparent text-gray-500 hover:bg-gray-100"
          )}
        >
          All Time
        </Button>
        <Button 
          onClick={() => setActiveLeagueCategory('allTimeTeam')}
          className={cn(
            "flex-1 px-4 py-2 text-base font-medium transition-colors rounded-full",
            activeCategory === 'allTimeTeam' 
              ? "bg-[#fbb350] text-white hover:bg-[#fbb350]/90" 
              : "bg-transparent text-gray-500 hover:bg-gray-100"
          )}
        >
          All Time Team
        </Button>
      </div>
      
      <div className="relative h-48 bg-gradient-to-t from-[#51c1a9]/20 via-[#51c1a9]/10 to-transparent rounded-[20px] mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#51c1a9]/20 to-transparent" />
        <svg className="w-full h-full relative" preserveAspectRatio="none">
          <Tooltip>
            <TooltipTrigger asChild>
              <path
                d={`M0,${100 - (leagueData[activeCategory][0].points / 100) * 100} 
                    C150,${80 - (leagueData[activeCategory][0].points / 100) * 20} 
                    350,${90 - (leagueData[activeCategory][0].points / 100) * 30} 
                    500,${85 - (leagueData[activeCategory][0].points / 100) * 25}`}
                fill="none"
                stroke="#51c1a9"
                strokeWidth="2"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Your progress</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <path
                d={`M0,${110 - (leagueData[activeCategory][0].points / 100) * 100} 
                    C100,${95 - (leagueData[activeCategory][0].points / 100) * 20} 
                    300,${105 - (leagueData[activeCategory][0].points / 100) * 30} 
                    500,${100 - (leagueData[activeCategory][0].points / 100) * 25}`}
                fill="none"
                stroke="#fbb350"
                strokeWidth="2"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>League average</p>
            </TooltipContent>
          </Tooltip>
        </svg>
      </div>

      <div className="space-y-2">
        <div className="bg-[#51c1a9] text-white p-2 rounded-[20px] flex items-center gap-2 text-sm">
          <span className="text-white/90 font-medium">#{leagueData[activeCategory][0].rank}</span>
          <img src={leagueData[activeCategory][0].avatar} alt="" className="w-8 h-8 rounded-full" />
          <div className="flex items-center gap-1">
            <span className="font-medium">{leagueData[activeCategory][0].name}</span>
            {leagueData[activeCategory][0].badge && (
              <img 
                src={leagueData[activeCategory][0].badge} 
                alt="Badge" 
                className="w-5 h-5" 
              />
            )}
          </div>
          <span className="ml-auto font-medium">{leagueData[activeCategory][0].points} pts</span>
        </div>

        <h3 className="text-base font-semibold text-[#556bc7] mt-4 mb-2">Top 3 places</h3>

        {leagueData[activeCategory].slice(1).map((player, index) => (
          <div 
            key={player.rank} 
            className={cn(
              "p-2 rounded-[20px] flex items-center gap-2 text-sm border",
              index === 0 ? "border-[#fbb350] text-[#fbb350]" : // 1st place
              index === 1 ? "border-[#556bc7] text-[#556bc7]" : // 2nd place
              "border-[#f97316] text-[#f97316]" // 3rd place
            )}
          >
            <span className="font-medium">#{player.rank}</span>
            <img src={player.avatar} alt="" className="w-8 h-8 rounded-full" />
            <div className="flex items-center gap-1">
              <span className="font-medium">{player.name}</span>
              {player.badge && (
                <img 
                  src={player.badge} 
                  alt="Badge" 
                  className="w-5 h-5" 
                />
              )}
            </div>
            <span className="ml-auto font-medium">{player.points} pts</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function VisionBoardDashboard() {
  const [currentDate] = useState(new Date(2024, 10, 17))
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0)
  const [activeAchievementCategory, setActiveAchievementCategory] = useState('practice-streak')
  const [activeLeagueCategory, setActiveLeagueCategory] = useState<'weekly' | 'allTime' | 'allTimeTeam'>('weekly')
  const [visionItems, setVisionItems] = useState<VisionItem[]>([])
  const [maxZIndex, setMaxZIndex] = useState(0)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [interactionType, setInteractionType] = useState<'move' | 'resize' | null>(null)
  const [interactionStart, setInteractionStart] = useState<{ x: number, y: number } | null>(null)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [glowColor, setGlowColor] = useState('rgba(85, 107, 199, 0.3)')
  const boardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const calendar = Array.from({ length: 30 }, (_, i) => i + 1)
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const streakData = {
    current: 7,
    consistency: '83%',
    longest: 7
  }

  const leagueData: Record<string, LeaguePlayer[]> = {
    weekly: [
      { rank: 10, name: 'You', points: 93, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-9Ut5P-Z7Q-qcpgWOIlslCA-YQ3T7zHwThCVVysgv9KyEg-removebg-preview-xm0mDAmejz7GVlSJPPqUIeKh1ygBL8.png' },
      { rank: 1, name: 'Agent45', points: 98, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.19.01_2cecae84-removebg-preview-3wBv81wHW6Ya9A4xe2lgnPVfi9BkC6.png' },
      { rank: 2, name: 'Agent23', points: 97, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.59_dac37adb-removebg-preview-4wxMtjKvSvJ1wdrprNbJ1IKOOMlgcw.png' },
      { rank: 3, name: 'Agent35', points: 96, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.58_44ffd513-removebg-preview-E4hPl1pYL2la0jvrklcaFpVblXa28d.png' },
    ],
    allTime: [
      { rank: 15, name: 'You', points: 1250, avatar: '/placeholder.svg?height=32&width=32' },
      { rank: 1, name: 'TopAgent', points: 1500, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-large-radiant-gold-medal-with-a-b-T5VpM4deRuWtnNpknWeXKA-oVpwYeqBTOuOBOCRRskHXg-removebg-preview-Sy7TVr1liR5FzaFhizFxCYSBdn4dp6.png' },
      { rank: 2, name: 'SuperSeller', points: 1450, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.59_dac37adb-removebg-preview-4wxMtjKvSvJ1wdrprNbJ1IKOOMlgcw.png' },
      { rank: 3, name: 'MegaCloser', points: 1400, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.58_44ffd513-removebg-preview-E4hPl1pYL2la0jvrklcaFpVblXa28d.png' },
    ],
    allTimeTeam: [
      { rank: 5, name: 'Your Team', points: 5000, avatar: '/placeholder.svg?height=32&width=32' },
      { rank: 1, name: 'Dream Team', points: 5500, avatar: '/placeholder.svg?height=32&width=32' },
      { rank: 2, name: 'Power Sellers', points: 5300, avatar: '/placeholder.svg?height=32&width=32' },
      { rank: 3, name: 'Top Performers', points: 5200, avatar: '/placeholder.svg?height=32&width=32' },
    ],
  }

  const dailyTasks = [
    { text: 'Complete these 3 price negotiation scenarios by Friday', color: 'bg-[#fbb350]' },
    { text: 'Practice with AI bot on product X for 20 minutes daily', color: 'bg-[#51c1a9]' },
    { text: 'Role-play these specific customer personas with detailed feedback', color: 'bg-[#556bc7]' },
  ]

  const improvements = [
    { text: 'Investor should ask clearer questions on final terms and conditions', color: 'bg-[#fbb350]' },
    { text: 'Clarify lease terms better with detailed explanations', color: 'bg-[#51c1a9]' },
    { text: 'Set a specific follow-up plan to keep hold times low and maintain engagement', color: 'bg-[#556bc7]' },
  ]

  const activities: ActivityCircle[] = [
    { value: 5, label: 'TODAY', progress: 75, color: '#556bc7', icon: 'clock', max: 10 },
    { value: 18, label: 'THIS WEEK', progress: 60, color: '#51c1a9', icon: 'calendar', max: 50 },
    { value: 12, label: 'THIS MONTH', progress: 25, color: '#fbb350', icon: 'calendar', max: 100 },
    { value: 42, label: 'THIS YEAR', progress: 10, color: '#fbb350', icon: 'calendar', max: 1000 },
  ]

  const achievements: Record<string, Achievement[]> = {
    'practice-streak': [
      { 
        name: '5 Day Streak', 
        progress: 100,
        badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-HWOAO1EUTGSglSzZlSFjHA-dQjZimptRd-0SpN_-6oU5w-removebg-preview-afRSEobMghbwvgQDYDT4Foh6UMYYPk.png'
      },
      { 
        name: '10 Day Streak', 
        progress: 100,
        badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-QHfb4ipTQUu1iR54Vmxo6g-RFBtanJsS0aS2a2tOFHHXg-removebg-preview-fWR9tkF2MvRte4gcxanOH0BT7YiTYs.png'
      },
      { 
        name: '30 Day Streak', 
        progress: 80,
        badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-CSU-cRrnTDCAuvGYTSV90w-taY5gPBoQxydiszFPNpDvQ-removebg-preview-70auRSvZDbTm3bFEFiCBrnF9kQVU9c.png'
      },
      { 
        name: '90 Day Streak', 
        progress: 45,
        badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-RCaF4tpKT7aJoICZ2L508Q-UCW5RDP4Q4KfvoRnq8NlfA-removebg-preview-tHPlOSXZl30GH4jugQypZiOxPaqd2v.png'
      },
      { 
        name: '180 Day Streak', 
        progress: 20,
        badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-L5aDOKYDTgKsB2lxHimuQQ-2xr3cxz6RCeNCL9HhBtylA-removebg-preview-6pFE6lKlRPmL6hlCCVBVWQfjq5SGkn.png',
        locked: true
      },
      { 
        name: '365 Day Streak', 
        progress: 5,
        badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-9Ut5P-Z7Q-qcpgWOIlslCA-YQ3T7zHwThCVVysgv9KyEg-removebg-preview-UX2ycYk0Obekhk5ZuAdxefGuuQfmrH.png',
        locked: true
      },
    ],
    'completed-calls': [
      { name: '10 Calls', progress: 100 },
      { name: '25 Calls', progress: 100 },
      { name: '50 Calls', progress: 100 },
      { name: '100 Calls', progress: 80 },
      { name: '250 Calls', progress: 60 },
      { name: '500 Calls', progress: 40 },
      { name: '750 Calls', progress: 20 },
      { name: '1000 Calls', progress: 10 },
      { name: '1500 Calls', progress: 5 },
      { name: '2500 Calls', progress: 0 },
    ],
    'activity-goals': [
      { name: '10 Sessions in a Day', progress: 80 },
      { name: '50 Sessions in a Week', progress: 60 },
      { name: '100 Sessions in a Month', progress: 40 },
    ],
    'league-places': [
      { name: 'Bronze League', progress: 100 },
      { name: 'Silver League', progress: 75 },
      { name: 'Gold League', progress: 45 },
    ],
  }

  const nextActivitySlide = () => {
    setCurrentActivityIndex((prev) => (prev + 1) % activities.length)
  }

  const prevActivitySlide = () => {
    setCurrentActivityIndex((prev) => (prev - 1 + activities.length) % activities.length)
  }

  const getProgressBarColor = (progress: number) => {
    if (progress === 100) return 'bg-[#556bc7]' // Blue Diamond
    if (progress >= 70) return 'bg-[#51c1a9]'   // Green
    if (progress >= 40) return 'bg-[#fbb350]'   // Orange
    return 'bg-[#ef4444]'                       // Red
  }

  const CircularProgress = ({ value, max, color, children }: { value: number; max: number; color: string; children: React.ReactNode }) => {
    const progress = (value / max) * 100
    const radius = 80
    const strokeWidth = 8
    const normalizedRadius = radius - strokeWidth * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDashoffset = circumference - ((progress / 100) * circumference * 0.75) // Multiply by 0.75 to only show 3/4 of the circle
    const rotation = -135 // Start at -135 degrees to position the gap at the bottom-left

    return (
      <div className="relative inline-flex items-center justify-center">
        <div 
          className="absolute inset-0 rounded-full opacity-90" 
          style={{ backgroundColor: color }}
        />
        <svg
          height={radius * 2}
          width={radius * 2}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <circle
            stroke="rgba(255, 255, 255, 0.2)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          />
          <circle
            stroke="white"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.3s ease' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          {children}
        </div>
      </div>
    )
  }

Here's the full implementation of the VisionBoard dashboard:

```tsx project="VisionBoard" file="vision-board-dashboard.tsx" type="react"
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, ArrowRight, RefreshCcw, TrendingUp, Palette, Calendar, Clock, Upload, X, Lock } from 'lucide-react'
import { cn } from "@/lib/utils"

interface LeaguePlayer {
  rank: number
  name: string
  points: number
  avatar: string
  badge?: string
}

interface ActivityCircle {
  value: number
  label: string
  progress: number
  color: string
  icon: 'clock' | 'calendar'
  max: number
}

interface Achievement {
  name: string
  progress: number
  badge?: string
  locked?: boolean
}

interface VisionItem {
  id: string
  src: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  aspectRatio: number
}

const UploadIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const PaletteIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="7" r="1" />
    <circle cx="17" cy="12" r="1" />
    <circle cx="7" cy="12" r="1" />
    <circle cx="12" cy="17" r="1" />
    <path d="M3 12h4m10 0h4M12 3v4m0 10v4" />
  </svg>
)

const TrashIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM7 3h10M9 3v3M15 3v3M9 14v-4M15 14v-4" />
  </svg>
)

function ColorPicker({ color, onChange }: { color: string, onChange: (color: string) => void }) {
  const [hue, setHue] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const pickerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      setPosition({ x, y })
      const newColor = `hsl(${hue}, ${x * 100}%, ${100 - y * 100}%)`
      onChange(newColor)
    }
  }

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value)
    setHue(newHue)
    const newColor = `hsl(${newHue}, ${position.x * 100}%, ${100 - position.y * 100}%)`
    onChange(newColor)
  }

  return (
    <div className="p-4 w-64 space-y-4">
      <div
        ref={pickerRef}
        className="w-full h-40 rounded-lg cursor-crosshair relative"
        style={{
          background: `linear-gradient(to bottom, white, transparent),
                      linear-gradient(to right, transparent, hsl(${hue}, 100%, 50%))`,
          backgroundColor: 'black'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => e.buttons === 1 && handleMouseDown(e)}
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-white absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`,
            backgroundColor: color
          }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="360"
        value={hue}
        onChange={handleHueChange}
        className="color-slider w-full h-3 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )
}

function League({ activeCategory, leagueData, setActiveLeagueCategory }: { activeCategory: string, leagueData: Record<string, LeaguePlayer[]>, setActiveLeagueCategory: (category: 'weekly' | 'allTime' | 'allTimeTeam') => void }) {
  return (
    <Card className="p-3 bg-white rounded-[20px] shadow-lg h-full">
      <h2 className="text-2xl font-semibold text-[#556bc7] mb-4">League</h2>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          onClick={() => setActiveLeagueCategory('weekly')}
          className={cn(
            "flex-1 px-4 py-2 text-base font-medium transition-colors rounded-full",
            activeCategory === 'weekly' 
              ? "bg-[#fbb350] text-white hover:bg-[#fbb350]/90" 
              : "bg-transparent text-gray-500 hover:bg-gray-100"
          )}
        >
          Weekly League
        </Button>
        <Button 
          onClick={() => setActiveLeagueCategory('allTime')}
          className={cn(
            "flex-1 px-4 py-2 text-base font-medium transition-colors rounded-full",
            activeCategory === 'allTime' 
              ? "bg-[#fbb350] text-white hover:bg-[#fbb350]/90" 
              : "bg-transparent text-gray-500 hover:bg-gray-100"
          )}
        >
          All Time
        </Button>
        <Button 
          onClick={() => setActiveLeagueCategory('allTimeTeam')}
          className={cn(
            "flex-1 px-4 py-2 text-base font-medium transition-colors rounded-full",
            activeCategory === 'allTimeTeam' 
              ? "bg-[#fbb350] text-white hover:bg-[#fbb350]/90" 
              : "bg-transparent text-gray-500 hover:bg-gray-100"
          )}
        >
          All Time Team
        </Button>
      </div>
      
      <div className="relative h-48 bg-gradient-to-t from-[#51c1a9]/20 via-[#51c1a9]/10 to-transparent rounded-[20px] mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#51c1a9]/20 to-transparent" />
        <svg className="w-full h-full relative" preserveAspectRatio="none">
          <Tooltip>
            <TooltipTrigger asChild>
              <path
                d={`M0,${100 - (leagueData[activeCategory][0].points / 100) * 100} 
                    C150,${80 - (leagueData[activeCategory][0].points / 100) * 20} 
                    350,${90 - (leagueData[activeCategory][0].points / 100) * 30} 
                    500,${85 - (leagueData[activeCategory][0].points / 100) * 25}`}
                fill="none"
                stroke="#51c1a9"
                strokeWidth="2"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Your progress</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <path
                d={`M0,${110 - (leagueData[activeCategory][0].points / 100) * 100} 
                    C100,${95 - (leagueData[activeCategory][0].points / 100) * 20} 
                    300,${105 - (leagueData[activeCategory][0].points / 100) * 30} 
                    500,${100 - (leagueData[activeCategory][0].points / 100) * 25}`}
                fill="none"
                stroke="#fbb350"
                strokeWidth="2"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>League average</p>
            </TooltipContent>
          </Tooltip>
        </svg>
      </div>

      <div className="space-y-2">
        <div className="bg-[#51c1a9] text-white p-2 rounded-[20px] flex items-center gap-2 text-sm">
          <span className="text-white/90 font-medium">#{leagueData[activeCategory][0].rank}</span>
          <img src={leagueData[activeCategory][0].avatar} alt="" className="w-8 h-8 rounded-full" />
          <div className="flex items-center gap-1">
            <span className="font-medium">{leagueData[activeCategory][0].name}</span>
            {leagueData[activeCategory][0].badge && (
              <img 
                src={leagueData[activeCategory][0].badge} 
                alt="Badge" 
                className="w-5 h-5" 
              />
            )}
          </div>
          <span className="ml-auto font-medium">{leagueData[activeCategory][0].points} pts</span>
        </div>

        <h3 className="text-base font-semibold text-[#556bc7] mt-4 mb-2">Top 3 places</h3>

        {leagueData[activeCategory].slice(1).map((player, index) => (
          <div 
            key={player.rank} 
            className={cn(
              "p-2 rounded-[20px] flex items-center gap-2 text-sm border",
              index === 0 ? "border-[#fbb350] text-[#fbb350]" : // 1st place
              index === 1 ? "border-[#556bc7] text-[#556bc7]" : // 2nd place
              "border-[#f97316] text-[#f97316]" // 3rd place
            )}
          >
            <span className="font-medium">#{player.rank}</span>
            <img src={player.avatar} alt="" className="w-8 h-8 rounded-full" />
            <div className="flex items-center gap-1">
              <span className="font-medium">{player.name}</span>
              {player.badge && (
                <img 
                  src={player.badge} 
                  alt="Badge" 
                  className="w-5 h-5" 
                />
              )}
            </div>
            <span className="ml-auto font-medium">{player.points} pts</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function VisionBoardDashboard() {
  const [currentDate] = useState(new Date(2024, 10, 17))
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0)
  const [activeAchievementCategory, setActiveAchievementCategory] = useState('practice-streak')
  const [activeLeagueCategory, setActiveLeagueCategory] = useState<'weekly' | 'allTime' | 'allTimeTeam'>('weekly')
  const [visionItems, setVisionItems] = useState<VisionItem[]>([])
  const [maxZIndex, setMaxZIndex] = useState(0)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [interactionType, setInteractionType] = useState<'move' | 'resize' | null>(null)
  const [interactionStart, setInteractionStart] = useState<{ x: number, y: number } | null>(null)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [glowColor, setGlowColor] = useState('rgba(85, 107, 199, 0.3)')
  const boardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const calendar = Array.from({ length: 30 }, (_, i) => i + 1)
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const streakData = {
    current: 7,
    consistency: '83%',
    longest: 7
  }

  const leagueData: Record<string, LeaguePlayer[]> = {
    weekly: [
      { rank: 10, name: 'You', points: 93, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-9Ut5P-Z7Q-qcpgWOIlslCA-YQ3T7zHwThCVVysgv9KyEg-removebg-preview-xm0mDAmejz7GVlSJPPqUIeKh1ygBL8.png' },
      { rank: 1, name: 'Agent45', points: 98, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.19.01_2cecae84-removebg-preview-3wBv81wHW6Ya9A4xe2lgnPVfi9BkC6.png' },
      { rank: 2, name: 'Agent23', points: 97, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.59_dac37adb-removebg-preview-4wxMtjKvSvJ1wdrprNbJ1IKOOMlgcw.png' },
      { rank: 3, name: 'Agent35', points: 96, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.58_44ffd513-removebg-preview-E4hPl1pYL2la0jvrklcaFpVblXa28d.png' },
    ],
    allTime: [
      { rank: 15, name: 'You', points: 1250, avatar: '/placeholder.svg?height=32&width=32' },
      { rank: 1, name: 'TopAgent', points: 1500, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-large-radiant-gold-medal-with-a-b-T5VpM4deRuWtnNpknWeXKA-oVpwYeqBTOuOBOCRRskHXg-removebg-preview-Sy7TVr1liR5FzaFhizFxCYSBdn4dp6.png' },
      { rank: 2, name: 'SuperSeller', points: 1450, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.59_dac37adb-removebg-preview-4wxMtjKvSvJ1wdrprNbJ1IKOOMlgcw.png' },
      { rank: 3, name: 'MegaCloser', points: 1400, avatar: '/placeholder.svg?height=32&width=32', badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.58_44ffd513-removebg-preview-E4hPl1pYL2la0jvrklcaFpVblXa28d.png' },
    ],
    allTimeTeam: [
      { rank: 5, name: 'Your Team', points: 5000, avatar: '/placeholder.svg?height=32&width=32' },
      { rank: 1, name: 'Dream Team', points: 5500, avatar: '/placeholder.svg?height=32&width=32' },
      { rank: 2, name: 'Power Sellers', points: 5300, avatar: '/placeholder.svg?height=32&width=32' },
      { rank: 3, name: 'Top Performers', points: 5200, avatar: '/placeholder.svg?height=32&width=32' },
    ],
  }

  const dailyTasks = [
    { text: 'Complete these 3 price negotiation scenarios by Friday', color: 'bg-[#fbb350]' },
    { text: 'Practice with AI bot on product X for 20 minutes daily', color: 'bg-[#51c1a9]' },
    { text: 'Role-play these specific customer personas with detailed feedback', color: 'bg-[#556bc7]' },
  ]

  const improvements = [
    { text: 'Investor should ask clearer questions on final terms and conditions', color: 'bg-[#fbb350]' },
    { text: 'Clarify lease terms better with detailed explanations', color: 'bg-[#51c1a9]' },
    { text: 'Set a specific follow-up plan to keep hold times low and maintain engagement', color: 'bg-[#556bc7]' },
  ]

  const activities: ActivityCircle[] = [
    { value: 5, label: 'TODAY', progress: 75, color: '#556bc7', icon: 'clock', max: 10 },
    { value: 18, label: 'THIS WEEK', progress: 60, color: '#51c1a9', icon: 'calendar', max: 50 },
    { value: 12, label: 'THIS MONTH', progress: 25, color: '#fbb350', icon: 'calendar', max: 100 },
    { value: 42, label: 'THIS YEAR', progress: 10, color: '#fbb350', icon: 'calendar', max: 1000 },
  ]

  const achievements: Record<string, Achievement[]> = {
    'practice-streak': [
      { 
        name: '5 Day Streak', 
        progress: 100,
        badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-HWOAO1EUTGSglSzZlSFjHA-dQjZimptRd-0SpN_-6oU5w-removebg-preview-afRSEobMghbwvgQDYDT4Foh6UMYYPk.png'
      },
      { 
        name: '10 Day Streak', 
        progress: 100,
        badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-QHfb4ipTQUu1iR54Vmxo6g-RFBtanJsS0aS2a2tOFHHXg-removebg-preview-fWR9tkF2MvRte4gcxanOH0BT7YiTYs.png'
      },
      { 
        name: '30 Day Streak', 
        progress: 80,
        badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-CSU-cRrnTDCAuvGYTSV90w-taY5gPBoQxydiszFPNpDvQ-removebg-preview-70auRSvZDbTm3bFEFiCBrnF9kQVU9c.png'
      },
      { 
        name: '90 Day Streak', 
        progress: 45,
        badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-RCaF4tpKT7aJoICZ2L508Q-UCW5RDP4Q4KfvoRnq8NlfA-removebg-preview-tHPlOSXZl30GH4jugQypZiOxPaqd2v.png'
      },
      { 
        name: '180 Day Streak', 
        progress: 20,
        badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-L5aDOKYDTgKsB2lxHimuQQ-2xr3cxz6RCeNCL9HhBtylA-removebg-preview-6pFE6lKlRPmL6hlCCVBVWQfjq5SGkn.png',
        locked: true
      },
      { 
        name: '365 Day Streak', 
        progress: 5,
        badge: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-9Ut5P-Z7Q-qcpgWOIlslCA-YQ3T7zHwThCVVysgv9KyEg-removebg-preview-UX2ycYk0Obekhk5ZuAdxefGuuQfmrH.png',
        locked: true
      },
    ],
    'completed-calls': [
      { name: '10 Calls', progress: 100 },
      { name: '25 Calls', progress: 100 },
      { name: '50 Calls', progress: 100 },
      { name: '100 Calls', progress: 80 },
      { name: '250 Calls', progress: 60 },
      { name: '500 Calls', progress: 40 },
      { name: '750 Calls', progress: 20 },
      { name: '1000 Calls', progress: 10 },
      { name: '1500 Calls', progress: 5 },
      { name: '2500 Calls', progress: 0 },
    ],
    'activity-goals': [
      { name: '10 Sessions in a Day', progress: 80 },
      { name: '50 Sessions in a Week', progress: 60 },
      { name: '100 Sessions in a Month', progress: 40 },
    ],
    'league-places': [
      { name: 'Bronze League', progress: 100 },
      { name: 'Silver League', progress: 75 },
      { name: 'Gold League', progress: 45 },
    ],
  }

  const nextActivitySlide = () => {
    setCurrentActivityIndex((prev) => (prev + 1) % activities.length)
  }

  const prevActivitySlide = () => {
    setCurrentActivityIndex((prev) => (prev - 1 + activities.length) % activities.length)
  }

  const getProgressBarColor = (progress: number) => {
    if (progress === 100) return 'bg-[#556bc7]' // Blue Diamond
    if (progress >= 70) return 'bg-[#51c1a9]'   // Green
    if (progress >= 40) return 'bg-[#fbb350]'   // Orange
    return 'bg-[#ef4444]'                       // Red
  }

  const CircularProgress = ({ value, max, color, children }: { value: number; max: number; color: string; children: React.ReactNode }) => {
    const progress = (value / max) * 100
    const radius = 80
    const strokeWidth = 8
    const normalizedRadius = radius - strokeWidth * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDashoffset = circumference - ((progress / 100) * circumference * 0.75) // Multiply by 0.75 to only show 3/4 of the circle
    const rotation = -135 // Start at -135 degrees to position the gap at the bottom-left

    return (
      <div className="relative inline-flex items-center justify-center">
        <div 
          className="absolute inset-0 rounded-full opacity-90" 
          style={{ backgroundColor: color }}
        />
        <svg
          height={radius * 2}
          width={radius * 2}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <circle
            stroke="rgba(255, 255, 255, 0.2)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          />
          <circle
            stroke="white"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.3s ease' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          {children}
        </div>
      </div>
    )
  }

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && boardRef.current) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const aspectRatio = img.width / img.height
            const height = 300 // base height
            const width = height * aspectRatio
            const board = boardRef.current!.getBoundingClientRect()
            
            const maxX = board.width - width
            const maxY = board.height - height
            const x = Math.min(Math.max(0, Math.random() * maxX), maxX)
            const y = Math.min(Math.max(0, Math.random() * maxY), maxY)
            
            const newItem: VisionItem = {
              id: `vision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              src: e.target?.result as string,
              x,
              y,
              width,
              height,
              zIndex: maxZIndex + 1,
              aspectRatio
            }
            setVisionItems(prev => [...prev, newItem])
            setMaxZIndex(prev => prev + 1)
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      })
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [maxZIndex])

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-100 p-2">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Interactive Vision Board */}
          <Card className="p-4 bg-white rounded-[20px] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-[#556bc7]">Interactive Vision Board</h2>
              
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#fbb350] hover:bg-[#f9a238] text-white border-[#fbb350] gap-2 rounded-xl"
                    >
                      <PaletteIcon />
                      Color
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <ColorPicker color={glowColor} onChange={setGlowColor} />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#51c1a9] hover:bg-[#45a892] text-white border-[#51c1a9] gap-2 rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon />
                  Add Vision
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div 
              ref={boardRef} 
              className="relative w-full h-[400px] rounded-3xl bg-[#f0f1f7] shadow-lg border transition-all duration-300"
              style={{
                borderColor: glowColor,
                boxShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor.replace('0.3', '0.2')}`
              }}
              onMouseMove={handleInteractionMove}
              onMouseUp={handleInteractionEnd}
              onMouseLeave={handleInteractionEnd}
            >
              <div className="absolute inset-0 overflow-hidden">
                {visionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`absolute cursor-move group select-none`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      width: `${item.width}px`,
                      height: `${item.height}px`,
                      zIndex: item.zIndex,
                    }}
                    onMouseDown={(e) => handleInteractionStart(e, item.id, 'move')}
                  >
                    <div className="relative w-full h-full rounded-2xl overflow-hidden border shadow-lg transition-all duration-300"
                      style={{
                        borderColor: glowColor,
                        boxShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor.replace('0.3', '0.2')}`
                      }}>
                      <img 
                        src={item.src} 
                        alt="Vision Item" 
                        className="w-full h-full object-cover select-none" 
                        draggable="false"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#fbb350] hover:bg-[#f9a238] text-white"
                        onClick={() => deleteItem(item.id)}
                      >
                        <TrashIcon />
                      </Button>
                      <div className="resize-handle resize-handle-tl" onMouseDown={(e) => handleInteractionStart(e, item.id, 'resize', 'top-left')} />
                      <div className="resize-handle resize-handle-tr" onMouseDown={(e) => handleInteractionStart(e, item.id, 'resize', 'top-right')} />
                      <div className="resize-handle resize-handle-bl" onMouseDown={(e) => handleInteractionStart(e, item.id, 'resize', 'bottom-left')} />
                      <div className="resize-handle resize-handle-br" onMouseDown={(e) => handleInteractionStart(e, item.id, 'resize', 'bottom-right')} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Calendar & Streak */}
            <Card className="p-3 bg-white rounded-[20px] shadow-lg flex flex-col h-full">
              <h2 className="text-2xl font-semibold text-[#556bc7] mb-6">Calendar & Streak</h2>
              <div className="flex gap-3 mb-6">
                <div className="bg-[#556bc7] text-white px-3 py-2 rounded-[20px] flex-1">
                  <div className="text-xs font-medium text-center">Current</div>
                  <div className="text-2xl font-bold text-center">{streakData.current}</div>
                </div>
                <div className="bg-[#51c1a9] text-white px-3 py-2 rounded-[20px] flex-1">
                  <div className="text-xs font-medium text-center">Consistency</div>
                  <div className="text-2xl font-bold text-center">{streakData.consistency}</div>
                </div>
                <div className="bg-[#fbb350] text-white px-3 py-2 rounded-[20px] flex-1">
                  <div className="text-xs font-medium text-center">Longest</div>
                  <div className="text-2xl font-bold text-center">{streakData.longest}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" className="hover:bg-transparent">
                  <ArrowLeft className="w-4 h-4 text-gray-400" />
                </Button>
                <div className="text-base font-semibold">November 2024</div>
                <Button variant="ghost" size="icon" className="hover:bg-transparent">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2 flex-1">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm text-gray-400 font-medium mb-2">{day}</div>
                ))}
                {calendar.map(day => (
                  <div
                    key={day}
                    className={cn(
                      "text-center py-2.5 text-sm rounded-[16px] font-medium",
                      day >= 11 && day <= 16 ? "bg-[#51c1a9] text-white" : "",
                      day === 17 ? "border-2 border-[#556bc7] text-[#556bc7]" : "",
                      day === 18 ? "border-2 border-[#556bc7] text-[#556bc7]" : "",
                      "cursor-pointer"
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </Card>

            {/* League */}
            <League
              activeCategory={activeLeagueCategory}
              leagueData={leagueData}
              setActiveLeagueCategory={setActiveLeagueCategory}
            />

            {/* Daily Plan & Improvements */}
            <div className="space-y-4 flex flex-col h-full">
              <Card className="p-3 bg-white rounded-[20px] shadow-lg flex-1">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-[#556bc7]">Daily Personalized Plan</h2>
                    <Button variant="ghost" size="icon" className="hover:bg-transparent">
                      <RefreshCcw className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {dailyTasks.map((task, index) => (
                      <div
                        key={index}
                        className={`${task.color} p-2 rounded-[16px] flex items-start gap-2`}
                      >
                        <div className="w-4 h-4 rounded-lg border-2 border-white/90 flex-shrink-0 mt-0.5" />
                        <div className="text-white text-sm font-medium leading-tight">
                          {task.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-white rounded-[20px] shadow-lg flex-1">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-[#556bc7]">Areas of Improvement</h2>
                    <Button variant="ghost" size="icon" className="hover:bg-transparent">
                      <RefreshCcw className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {improvements.map((item, index) => (
                      <div key={index} className={`${item.color} p-2 rounded-[16px] flex items-start gap-2`}>
                        <TrendingUp className="w-4 h-4 text-white/90 mt-0.5" />
                        <div className="text-white text-sm font-medium">{item.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Achievement Showcase */}
            <Card className="p-4 bg-white rounded-[20px] shadow-lg md:col-span-2 h-[280px]">
              <h2 className="text-2xl font-semibold text-[#556bc7] mb-4">Achievement Showcase</h2>
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {Object.keys(achievements).map((category) => (
                  <Button
                    key={category}
                    variant={activeAchievementCategory === category ? 'default' : 'ghost'}
                    className={cn(
                      "px-6 py-3 rounded-full whitespace-nowrap",
                      activeAchievementCategory === category 
                        ? 'bg-[#fbb350] text-white hover:bg-[#fbb350]/90' 
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                    onClick={() => setActiveAchievementCategory(category)}
                  >
                    {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Button>
                ))}
              </div>
              <div className="space-y-6">
                <div className="h-[160px] overflow-y-auto pr-2">
                  {achievements[activeAchievementCategory].map((achievement, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div className="mb-6 flex gap-4">
                          <div className="relative w-[56px] h-[56px]">
                            {achievement.badge ? (
                              <img 
                                src={achievement.badge} 
                                alt="Achievement Badge" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-gray-200" />
                              </div>
                            )}
                            {achievement.locked && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                <Lock className="text-white" size={24}/>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex items-center justify-between h-[24px]">
                              <span className="text-lg font-medium">{achievement.name}</span>
                              <span className="text-lg text-gray-500">{achievement.progress}%</span>
                            </div>
                            <div className="h-[28px] flex items-center">
                              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ease-in-out ${getProgressBarColor(achievement.progress)}`}
                                  style={{ width: `${achievement.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{achievement.name} - {achievement.progress}% Complete ({Math.floor(achievement.progress / 10)} days)</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </Card>

            {/* Activity Circles */}
            <Card className="p-2 bg-white rounded-[20px] shadow-lg h-[280px]">
              <h2 className="text-lg font-semibold text-[#556bc7] mb-6">Activity Circles</h2>
              <div className="relative flex justify-center items-center mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -left-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                  onClick={prevActivitySlide}
                >
                  <ArrowLeft className="w-4 h-4 text-gray-400" />
                </Button>

                <div className="relative">
                  <div className="rounded-full">
                    <CircularProgress
                      value={activities[currentActivityIndex].value}
                      max={activities[currentActivityIndex].max}
                      color={activities[currentActivityIndex].color}
                    >
                      <span className="text-4xl font-bold mb-2">{activities[currentActivityIndex].value}</span>
                      <span className="text-sm tracking-wide">{activities[currentActivityIndex].label}</span>
                    </CircularProgress>
                  </div>

                  <div className="absolute -top-1 -right-1 bg-white rounded-[20px] p-2 shadow-lg">
                    <Clock className="w-3 h-3 text-[#556bc7]" />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                  onClick={nextActivitySlide}
                >
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Button>
              </div>

              <div className="flex justify-center gap-2">
                {activities.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                      index === currentActivityIndex ? 'bg-gray-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </Card>
          </div>
          <style jsx global>{`
            .resize-handle {
              position: absolute;
              width: 10px;
              height: 10px;
              background-color: white;
              border: 1px solid #ccc;
            }
            .resize-handle-tl { top: -5px; left: -5px; cursor: nwse-resize; }
            .resize-handle-tr { top: -5px; right: -5px; cursor: nesw-resize; }
            .resize-handle-bl { bottom: -5px; left: -5px; cursor: nesw-resize; }
            .resize-handle-br { bottom: -5px; right: -5px; cursor: nwse-resize; }
            .color-slider {
              background: linear-gradient(to right, #fbb350 0%, #51c1a9 50%, #556bc7 100%);
            }
          `}</style>
        </div>
      </div>
    </TooltipProvider>
  )
}
