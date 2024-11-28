'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, ArrowRight, RefreshCcw, TrendingUp, Palette, Calendar, Clock, Upload, X, Lock } from 'lucide-react'
import { cn } from "@/lib/utils"
import { CustomCalendar } from "@/components/custom-calendar"
import { LeagueChart } from '@/components/LeagueChart'
import { AchievementContent, type AchievementContentProps } from './achievement-showcase';
import { Badge } from '@/lib/achievement-data';
import League from './league';
import { debounce } from 'lodash';
import { Maximize2 } from 'lucide-react'


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

const getMemberId = async () => {
  try {
    // Try Memberstack first
    const memberstack = (window as any).memberstack;
    if (memberstack) {
      const member = await memberstack.getCurrentMember();
      if (member) return member.id;
    }
    
    // Fallback to URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('memberId');
    if (memberId) return memberId;
    
    // Final fallback
    return 'test123';
  } catch (error) {
    console.log('Using test member ID');
    return 'test123';
  }
};

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

export default function VisionBoardDashboardClient() {
  const [currentDate] = useState(new Date(2024, 10, 17))
  const [memberId, setMemberId] = useState<string | null>(null);
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
  const [isFullScreen, setIsFullScreen] = useState(false)

useEffect(() => {
    getMemberId().then(setMemberId);
  }, []);

useEffect(() => {
    const loadVisionBoard = async () => {
      try {
        const memberId = await getMemberId();
        
        const response = await fetch(`/api/vision-board?memberId=${memberId}`)
        
        if (!response.ok) {
          console.error('Failed to load vision board')
          return
        }
        
        const data = await response.json()
        if (data && data.length > 0) {
          setVisionItems(data.map((item: any) => ({
            id: item.id.toString(),
            src: item.image_url,
            x: item.x_position,
            y: item.y_position,
            width: item.width,
            height: item.height,
            zIndex: item.z_index,
            aspectRatio: item.width / item.height
          })))
          
          setGlowColor(data[0]?.board_color || 'rgba(85, 107, 199, 0.3)')
        }
      } catch (error) {
        console.error('Load error:', error)
      }
    }
    
    loadVisionBoard()
}, [])

useEffect(() => {
  const fetchDailyTasks = async () => {
    try {
      const memberId = await getMemberId();
      const response = await fetch(`/api/daily-tasks?memberId=${memberId}`);
      if (response.ok) {
        const data = await response.json();
        setDailyTasks([
          { text: data.task_1, color: 'bg-[#fbb350]' },
          { text: data.task_2, color: 'bg-[#51c1a9]' },
          { text: data.task_3, color: 'bg-[#556bc7]' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching daily tasks:', error);
    }
  };

  fetchDailyTasks();
}, []);

  const calendar = Array.from({ length: 30 }, (_, i) => i + 1)
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const [streakData, setStreakData] = useState({
  current: 0,
  consistency: '0%',
  longest: 0,
  dates: []
});

useEffect(() => {
  const fetchStreakData = async () => {
    try {
      const memberId = await getMemberId();
      const response = await fetch(`/api/streaks?memberId=${memberId}`);
      if (response.ok) {
        const data = await response.json();
        setStreakData(data);
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  };

  fetchStreakData();
}, []);

useEffect(() => {
  const fetchImprovements = async () => {
    try {
      const memberId = await getMemberId();
      const response = await fetch(`/api/improvements?memberId=${memberId}`);
      if (response.ok) {
        const data = await response.json();
        setImprovements([
          { text: data.improvement_1, color: 'bg-[#fbb350]' },
          { text: data.improvement_2, color: 'bg-[#51c1a9]' },
          { text: data.improvement_3, color: 'bg-[#556bc7]' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching improvements:', error);
    }
  };

  fetchImprovements();
}, []);

useEffect(() => {
  const fetchActivityData = async () => {
    try {
      const memberId = await getMemberId();
      const response = await fetch(`/api/activity-sessions?memberId=${memberId}`);
      if (response.ok) {
        const data = await response.json();
        
        setActivities([
          { value: data.today, label: 'TODAY', progress: (data.today / 10) * 100, color: '#556bc7', icon: 'clock', max: 10 },
          { value: data.week, label: 'THIS WEEK', progress: (data.week / 50) * 100, color: '#51c1a9', icon: 'calendar', max: 50 },
          { value: data.month, label: 'THIS MONTH', progress: (data.month / 100) * 100, color: '#fbb350', icon: 'calendar', max: 100 },
          { value: data.year, label: 'THIS YEAR', progress: (data.year / 1000) * 100, color: '#fbb350', icon: 'calendar', max: 1000 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  fetchActivityData();
}, []);

useEffect(() => {
  const fetchAchievementData = async () => {
    try {
      const memberId = await getMemberId();
      const response = await fetch(`/api/achievements?memberId=${memberId}`);
      if (response.ok) {
        const data = await response.json();
        setAchievementData({
          streakAchievements: data.streakAchievements || [],
          callAchievements: data.callAchievements || [],
          activityAchievements: data.activityAchievements || [],
          leagueAchievements: data.leagueAchievements || []
        });
      }
    } catch (error) {
      console.error('Error fetching achievement data:', error);
    }
  };

  fetchAchievementData();
}, []);

  const [dailyTasks, setDailyTasks] = useState([
  { text: 'Loading...', color: 'bg-[#fbb350]' },
  { text: 'Loading...', color: 'bg-[#51c1a9]' },
  { text: 'Loading...', color: 'bg-[#556bc7]' },
]);

  const [improvements, setImprovements] = useState([
  { text: 'Loading...', color: 'bg-[#fbb350]' },
  { text: 'Loading...', color: 'bg-[#51c1a9]' },
  { text: 'Loading...', color: 'bg-[#556bc7]' },
]);

  const [activities, setActivities] = useState<ActivityCircle[]>([
    { value: 0, label: 'TODAY', progress: 0, color: '#556bc7', icon: 'clock', max: 10 },
    { value: 0, label: 'THIS WEEK', progress: 0, color: '#51c1a9', icon: 'calendar', max: 50 },
    { value: 0, label: 'THIS MONTH', progress: 0, color: '#fbb350', icon: 'calendar', max: 100 },
    { value: 0, label: 'THIS YEAR', progress: 0, color: '#fbb350', icon: 'calendar', max: 1000 },
]);

const [achievementData, setAchievementData] = useState<AchievementContentProps['achievements']>({
  streakAchievements: [],
  callAchievements: [],
  activityAchievements: [],
  leagueAchievements: []
});

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

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !boardRef.current) return

    try {
      const memberId = await getMemberId();

      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const img = new Image()
          img.onload = async () => {
            const aspectRatio = img.width / img.height
            const height = 300
            const width = height * aspectRatio
            const board = boardRef.current!.getBoundingClientRect()
            
            const maxX = board.width - width
            const maxY = board.height - height
            const x = Math.min(Math.max(0, Math.random() * maxX), maxX)
            const y = Math.min(Math.max(0, Math.random() * maxY), maxY)
            
            try {
              const response = await fetch('/api/vision-board', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  memberstack_id: memberId,
                  image_url: e.target?.result,
                  x_position: x,
                  y_position: y,
                  width,
                  height,
                  z_index: maxZIndex + 1,
                  board_color: glowColor
                })
              })

              if (!response.ok) throw new Error('Failed to save image')
              
              const savedItem = await response.json()
              const newItem: VisionItem = {
                id: savedItem.id.toString(),
                src: savedItem.image_url,
                x: savedItem.x_position,
                y: savedItem.y_position,
                width: savedItem.width,
                height: savedItem.height,
                zIndex: savedItem.z_index,
                aspectRatio
              }
              
              setVisionItems(prev => [...prev, newItem])
              setMaxZIndex(prev => prev + 1)
            } catch (error) {
              console.error('Failed to save image:', error)
            }
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Upload error:', error)
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
}, [maxZIndex, glowColor])

const updateItemPosition = useCallback(async (id: string, deltaX: number, deltaY: number) => {
  if (!memberId) return;
  
  setVisionItems(prev => {
    const newItems = prev.map(item => {
      if (item.id === id && boardRef.current) {
        const board = boardRef.current.getBoundingClientRect();
        const newX = Math.min(Math.max(0, item.x + deltaX), board.width - item.width);
        const newY = Math.min(Math.max(0, item.y + deltaY), board.height - item.height);
        
        fetch('/api/vision-board', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: parseInt(id),
            memberstack_id: memberId,
            x_position: newX,
            y_position: newY
          })
        });

        return { ...item, x: newX, y: newY };
      }
      return item;
    });
    return newItems;
  });
}, [memberId]);

const updateItemSize = useCallback((id: string, deltaWidth: number, deltaHeight: number, direction: string) => {
  if (!memberId) return;

  // Keep track of the previous state for rollback
  let previousState: VisionItem | null = null;

  setVisionItems(prev => {
    const newItems = prev.map(item => {
      if (item.id === id && boardRef.current) {
        // Store the previous state
        previousState = { ...item };
        
        const board = boardRef.current.getBoundingClientRect()
        let newWidth = item.width
        let newHeight = item.height
        let newX = item.x
        let newY = item.y

        // Calculate new dimensions (existing logic)
        if (direction.includes('right')) {
          newWidth = Math.min(Math.max(100, item.width + deltaWidth), board.width - item.x)
        } else if (direction.includes('left')) {
          const potentialWidth = Math.min(Math.max(100, item.width - deltaWidth), item.x + item.width)
          newX = item.x + (item.width - potentialWidth)
          newWidth = potentialWidth
        }

        if (direction.includes('bottom')) {
          newHeight = Math.min(Math.max(100, item.height + deltaHeight), board.height - item.y)
        } else if (direction.includes('top')) {
          const potentialHeight = Math.min(Math.max(100, item.height - deltaHeight), item.y + item.height)
          newY = item.y + (item.height - potentialHeight)
          newHeight = potentialHeight
        }

        // Maintain aspect ratio
        const aspectRatio = item.aspectRatio
        if (newWidth / newHeight > aspectRatio) {
          newWidth = newHeight * aspectRatio
        } else {
          newHeight = newWidth / aspectRatio
        }

        // Trigger debounced save
        debouncedSaveSize(id, newX, newY, newWidth, newHeight, previousState);

        return { ...item, width: newWidth, height: newHeight, x: newX, y: newY }
      }
      return item
    });
    return newItems;
  });
}, [memberId]);

// Debounced save function
const debouncedSaveSize = useCallback(
  debounce(async (
    id: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    previousState: VisionItem
  ) => {
    try {
      const response = await fetch('/api/vision-board', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(id),
          memberstack_id: memberId,
          x_position: x,
          y_position: y,
          width: width,
          height: height
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update dimensions');
      }
    } catch (error) {
      console.error('Failed to save dimensions:', error);
      
      // Rollback on failure
      if (previousState) {
        setVisionItems(prev => prev.map(item => 
          item.id === id ? previousState : item
        ));
      }
    }
  }, 500), // 500ms debounce delay
  [memberId]
);

// Cleanup debounced function on unmount
useEffect(() => {
  return () => {
    debouncedSaveSize.cancel();
  };
}, [debouncedSaveSize]);

  const bringToFront = useCallback((id: string) => {
    setMaxZIndex(prev => prev + 1)
    setVisionItems(prev => prev.map(item => item.id === id ? { ...item, zIndex: maxZIndex + 1 } : item))
  }, [maxZIndex])

 const deleteItem = useCallback(async (id: string) => {
  if (!memberId) return;

  try {
    const response = await fetch(`/api/vision-board?id=${id}&memberstack_id=${memberId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      setVisionItems(prev => prev.filter(item => item.id !== id));
    }
  } catch (error) {
    console.error('Delete error:', error);
  }
}, [memberId]);

  const handleInteractionStart = (event: React.MouseEvent, id: string, type: 'move' | 'resize', direction?: string) => {
    if (event.button !== 0) return // Only handle left mouse button
    event.stopPropagation()
    event.preventDefault()
    setActiveItem(id)
    setInteractionType(type)
    setInteractionStart({ x: event.clientX, y: event.clientY })
    if (type === 'resize' && direction) {
      setResizeDirection(direction)
    }
    bringToFront(id)
  }

  const handleInteractionMove = (event: React.MouseEvent) => {
    if (!activeItem || !interactionStart) return

    const deltaX = event.clientX - interactionStart.x
    const deltaY = event.clientY - interactionStart.y

    if (interactionType === 'move') {
      updateItemPosition(activeItem, deltaX, deltaY)
    } else if (interactionType === 'resize' && resizeDirection) {
      updateItemSize(activeItem, deltaX, deltaY, resizeDirection)
    }

    setInteractionStart({ x: event.clientX, y: event.clientY })
  }

  const handleInteractionEnd = () => {
    setActiveItem(null)
    setInteractionType(null)
    setInteractionStart(null)
    setResizeDirection(null)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleInteractionEnd()
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [])

const toggleFullScreen = () => {
  setIsFullScreen(prev => !prev);
}

  setIsFullScreen(prev => !prev);
}

useEffect(() => {
  const handleFullscreenChange = () => {
    setIsFullScreen(!!document.fullscreenElement);
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
}, []);

  return (
    <div className={`transition-all duration-300 ease-in-out ${
      isFullScreen 
        ? 'fixed inset-0 z-[100] bg-[#f0f1f7]' 
        : 'relative w-full h-[600px] bg-[#f0f1f7]'
    }`}>
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Interactive Vision Board */}
          <Card className="p-4 bg-white rounded-[20px] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-[#556bc7]">Interactive Vision Board</h2>
              <div className="flex gap-2">

<Popover>
  <PopoverTrigger>
    <Button
      variant="outline" 
      size="sm"
      className="bg-[#fbb350] hover:bg-[#f9a238] text-white border-[#fbb350] gap-2 rounded-xl"
    >
      <PaletteIcon />
      Color
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0 z-[9999]" align="end">
    <ColorPicker 
      color={glowColor} 
      onChange={async (newColor: string) => {
  try {
    setGlowColor(newColor);
    
    await fetch('/api/vision-board', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberstack_id: memberId,
        board_color: newColor
      })
    });
  } catch (error) {
    console.error('Color update error:', error);
  }
}}
    />
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
<Button
  variant="outline"
  size="lg"
  className="bg-[#556bc7] hover:bg-[#4a5eb3] text-white border-[#556bc7] gap-2 rounded-xl"
  onClick={toggleFullScreen}
>
  <Maximize2 />
  {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
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
  className={`relative w-full rounded-3xl bg-[#f0f1f7] shadow-lg border transition-all duration-300 overflow-hidden ${
    isFullScreen ? 'h-[calc(100vh-88px)]' : 'h-[calc(600px-88px)]'
  }`}
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
            <CustomCalendar streakData={streakData} />

            {/* League */}
            <League
              activeCategory={activeLeagueCategory}
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
<AchievementContent achievements={achievementData} />

            {/* Activity Circles */}
            <Card className="p-2 bg-white rounded-[20px] shadow-lg h-[280px]">
  <h2 className="text-2xl font-semibold text-[#556bc7] mb-6">Activity Circles</h2>
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
  )
}
