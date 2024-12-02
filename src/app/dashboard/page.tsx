'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Play, Pause, ChevronRight, ChevronLeft, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, Area, AreaChart } from 'recharts'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useSearchParams } from 'next/navigation'

type DateRange = {
  from: Date;
  to: Date;
} | null;

type Category = {
  key: string;
  label: string;
  description?: string;
}

type CategoryScore = {
  engagement: number;
  objection_handling: number;
  information_gathering: number;
  program_explanation: number;
  closing_skills: number;
  overall_effectiveness: number;
}

type ChartProps = {
  data: Array<{
    name: string;
    date: string;
  } & Partial<CategoryScore>>;
  category?: Category;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

interface CallLog {
  id: number;
  created_at: string;
  call_duration: number;
  power_moment: string;
  call_notes: string;
  level_up_1: string;
  level_up_2: string;
  level_up_3: string;
  call_transcript: string;
  strong_points: string;
  areas_for_improvement: string;
  engagement: number;
  objection_handling: number;
  information_gathering: number;
  program_explanation: number;
  closing_skills: number;
  overall_effectiveness: number;
  duration: number;
  agent_name: string;
}

const getColorByScore = (score: number) => {
  if (score >= 90) return '#51c1a9'  // Success green
  if (score >= 75) return '#556bc7'  // Progress blue
  if (score >= 60) return '#ffb367'  // Warning orange
  return '#ff5656'                   // Alert red
}

const Chart = ({ data, category, dateRange, setDateRange }: ChartProps) => {
 if (!data.length) {
   return (
     <Card className="relative overflow-hidden border-0 bg-white rounded-[32px] shadow-lg h-[400px] flex items-center justify-center">
       <div className="text-slate-500">No data available</div>
     </Card>
   )
 }

const filterByDateRange = (date: string) => {
    if (!dateRange) return true
    const itemDate = new Date(date)
    const fromDate = new Date(dateRange.from.setHours(0, 0, 0, 0))
    const toDate = new Date(dateRange.to.setHours(23, 59, 59, 999))
    return itemDate >= fromDate && itemDate <= toDate
  }

const chartData = React.useMemo(() => {
  return data
    .filter(item => filterByDateRange(item.date))
    .map(item => ({
      name: item.name,
      value: category ? item[category.key] : item.value
    }))
}, [data, dateRange, category, filterByDateRange])

 const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0
 const color = getColorByScore(latestValue || 0)

const noDataContent = (
  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
    <div className="text-lg">No data</div>
    <div className="text-sm mt-1">for selected time period</div>
  </div>
)

  return (
 <Card className="relative overflow-hidden border-0 bg-white rounded-[32px] shadow-lg [&>*:last-child]:overflow-visible">
   <div className="flex justify-between items-center p-6">
     <span className="text-slate-900 text-xl font-semibold">{category ? category.label : 'Average Success'}</span>
   </div>
   <CardContent className="p-0">
     {chartData.length === 0 ? noDataContent : (
       <div className="h-[320px] relative -mx-8 -mb-8 overflow-visible">
         <ResponsiveContainer width="100%" height="100%">
           <AreaChart 
             data={chartData} 
             margin={{ top: 16, right: 16, bottom: -48, left: -48 }}
           >
              <defs>
                <linearGradient id={`colorGradient-${category ? category.key : 'overall'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={false}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={false}
                domain={[0, 100]} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1c1c1c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  fontSize: '16px',
                  fontWeight: 500
                }}
                formatter={(value) => [`Average Success: ${value}`, '']}
                cursor={{
                  stroke: '#666',
                  strokeWidth: 1,
                  strokeDasharray: '4 4'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color}
                strokeWidth={2}
                fill={`url(#colorGradient-${category ? category.key : 'overall'})`}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: color,
                  stroke: "white",
                  strokeWidth: 2,
                  className: "drop-shadow-md"
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[64px] font-bold tracking-tight" style={{ color: getColorByScore(latestValue || 0) }}>
              {Math.round(latestValue || 0)}/100
            </div>
            <div className="text-lg text-slate-600 mt-1">Average Score</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const AudioPlayer = ({ src }: { src: string }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime)

    audio.addEventListener('loadeddata', setAudioData)
    audio.addEventListener('timeupdate', setAudioTime)

    return () => {
      audio.removeEventListener('loadeddata', setAudioData)
      audio.removeEventListener('timeupdate', setAudioTime)
    }
  }, [])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSliderChange = (newValue: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const [newTime] = newValue
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full space-y-1.5">
      <audio ref={audioRef} src={src} />
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={togglePlayPause}
          className="h-8 w-8 rounded-full p-0 hover:bg-slate-100"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </Button>
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={handleSliderChange}
          className="flex-grow"
          aria-label="Audio progress"
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}

const DatePicker = ({ onChange }: { onChange: (range: DateRange) => void }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  
  const firstMonth = currentDate
  const secondMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
  
  const renderMonth = (date: Date) => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => null)

    return (
      <div className="space-y-4">
        <div className="text-xl font-semibold">
          {format(date, "MMMM yyyy")}
        </div>
        <div className="grid grid-cols-7 gap-2 text-sm">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-center text-slate-500">
              {day}
            </div>
          ))}
          {[...paddingDays, ...days].map((day, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-9 w-9 p-0 font-normal ${
                day === null
                  ? "invisible"
                  : "text-slate-900"
              } ${
                day === new Date().getDate() && date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear()
                  ? "border border-slate-200"
                  : ""
              }`}
              onClick={() => {
                if (day !== null) {
                  const selectedDate = new Date(date.getFullYear(), date.getMonth(), day)
                  onChange({
                    from: selectedDate,
                    to: selectedDate
                  })
                }
              }}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  const presets = [
    {
      label: "This Week",
      getValue: () => ({
        from: startOfWeek(new Date()),
        to: endOfWeek(new Date())
      })
    },
    {
      label: "Last Week",
      getValue: () => ({
        from: startOfWeek(subDays(new Date(), 7)),
        to: endOfWeek(subDays(new Date(), 7))
      })
    },
    {
      label: "Last 7 Days",
      getValue: () => ({
        from: subDays(new Date(), 7),
        to: new Date()
      })
    },
    {
      label: "This Month",
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
      })
    },
    {
      label: "Last 14 Days",
      getValue: () => ({
        from: subDays(new Date(), 14),
        to: new Date()
      })
    },
    {
      label: "Last 30 Days",
      getValue: () => ({
        from: subDays(new Date(), 30),
        to: new Date()
      })
    }
  ]

  return (
    <Card className="p-4 space-y-4">
      <Button 
        variant="outline" 
        className="w-full justify-center text-center h-10 px-4 py-2"
        onClick={() => onChange(null)}
      >
        All time
      </Button>
      
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="h-7 w-7 p-0 hover:bg-transparent"
          onClick={() => setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous month</span>
        </Button>
        <div className="grid grid-cols-2 gap-8">
          {renderMonth(firstMonth)}
          {renderMonth(secondMonth)}
        </div>
        <Button
          variant="ghost"
          className="h-7 w-7 p-0 hover:bg-transparent"
          onClick={() => setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            className="justify-center"
            onClick={() => onChange(preset.getValue())}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </Card>
  )
}

export default function Component() {
  const searchParams = useSearchParams()
  const [dateRange, setDateRange] = useState<DateRange>(null)
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 5
  const [playCallModal, setPlayCallModal] = useState<{ isOpen: boolean; callId: number | null }>({ isOpen: false, callId: null })
  const [detailsModal, setDetailsModal] = useState<{ 
    isOpen: boolean; 
    call: CallLog | null 
  }>({ isOpen: false, call: null })
  const [callNotes, setCallNotes] = useState<Record<number, string>>({})
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleError = (error: unknown) => {
    setError(error instanceof Error ? error.message : 'An error occurred')
    setIsLoading(false)
  }

if (error) {
  return (
    <div className="flex items-center justify-center min-h-screen text-red-500">
      {error}
    </div>
  )
}

if (isLoading) {
  return <div className="flex items-center justify-center min-h-screen">Loading...</div>
}

useEffect(() => {
  const fetchCalls = async () => {
    const memberId = searchParams.get('memberId')
    if (!memberId) {
      setError('No member ID provided')
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/dashboard?memberId=${memberId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch calls')
      }
      const data = await response.json()
      setCallLogs(data)
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load calls')
    } finally {
      setIsLoading(false)
    }
  }

  fetchCalls()
}, [searchParams])

const indexOfLastRecord = currentPage * recordsPerPage
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
const currentRecords = callLogs.slice(indexOfFirstRecord, indexOfLastRecord)
const totalPages = Math.ceil(callLogs.length / recordsPerPage)

  if (!callLogs.length) {
    return <div className="flex items-center justify-center min-h-screen">No call data found</div>
  }

  const scoreCategories: Category[] = [
    { key: 'engagement', label: 'Engagement', description: 'Measures how well the agent connects with the customer and keeps them interested throughout the call.' },
    { key: 'objection_handling', label: 'Objection Handling', description: 'Evaluates the agent\'s ability to address and overcome customer concerns or objections.' },
    { key: 'information_gathering', label: 'Information Gathering', description: 'Assesses how effectively the agent collects relevant information from the customer.' },
    { key: 'program_explanation', label: 'Program Explanation', description: 'Rates the clarity and completeness of the agent\'s explanation of products or services.' },
    { key: 'closing_skills', label: 'Closing Skills', description: 'Measures the agent\'s ability to guide the conversation towards a successful conclusion or sale.' },
    { key: 'overall_effectiveness', label: 'Overall Effectiveness', description: 'A comprehensive score reflecting the agent\'s overall performance during the call.' },
  ]
    
    try {
      const response = await fetch(`/api/dashboard?memberId=${memberId}`)
      const data = await response.json()
      setCallLogs(data)
    } catch (error) {
      console.error('Error fetching calls:', error)
    }
  }

  fetchCalls()
}, [searchParams])


const chartData = React.useMemo(() => callLogs.map((call, index) => ({
  name: `${index + 1}`,
  date: call.created_at,
  engagement: call.engagement,
  objection_handling: call.objection_handling,
  information_gathering: call.information_gathering,
  program_explanation: call.program_explanation,
  closing_skills: call.closing_skills,
  overall_effectiveness: call.overall_effectiveness
})), [callLogs])

const averageSuccessData = React.useMemo(() => callLogs.map((call, index) => ({
  name: `${index + 1}`,
  date: call.created_at,
  value: call.overall_effectiveness
})), [callLogs])

  const toggleExpandCard = useCallback((id: number) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }, [])

  const handleNotesChange = (id: number, notes: string) => {
    setCallNotes(prev => ({
      ...prev,
      [id]: notes
    }))
  }

  const saveNotes = async (id: number) => {
  try {
    const response = await fetch(`/api/dashboard?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        call_notes: callNotes[id]
      })
    });
    if (!response.ok) throw new Error('Failed to save notes');
  } catch (error) {
    console.error('Error saving notes:', error);
  }
}

  return (
  <div className="min-h-screen p-8 bg-slate-50">
    {isLoading ? (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    ) : error ? (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Data</p>
          <p>{error}</p>
        </div>
      </div>
    ) : (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-white border-slate-200 text-slate-900 hover:bg-slate-50 h-9 px-4 py-2 text-sm font-medium rounded-full shadow-sm"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="bg-white border border-slate-200 p-0 shadow-lg rounded-xl w-auto" 
              align="end" 
              sideOffset={8}
            >
              <DatePicker onChange={setDateRange} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="mb-8">
          <Chart 
            data={averageSuccessData} 
            dateRange={dateRange} 
            setDateRange={setDateRange} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {scoreCategories.map((category) => (
            <div key={category.key}>
              <Chart 
                data={chartData} 
                category={category} 
                dateRange={dateRange} 
                setDateRange={setDateRange} 
              />
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold mb-6 text-slate-900 text-center">
          CALL RECORDS
        </h2>
        <div className="space-y-6">
          {currentRecords.map((call, index) => (
            <Card key={call.id} className="bg-white shadow-lg rounded-[32px] overflow-hidden border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-start mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src="/placeholder.svg?height=48&width=48"
                      alt="Profile"
                      className="rounded-full w-12 h-12 bg-slate-100"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{call.agent_name}</p>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Call {indexOfFirstRecord + index + 1}
                      </h2>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-slate-600">
                      {new Date(call.created_at).toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm font-medium text-slate-700 mt-1">
                      Call duration: {call.duration} minutes
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {scoreCategories.map((category) => {
                    const score = call[category.key]
                    const color = getColorByScore(score)
                    return (
                      <Popover key={category.key}>
                        <PopoverTrigger asChild>
                          <div className="relative overflow-hidden rounded-xl cursor-pointer" style={{ backgroundColor: `${color}20` }}>
                            <div className="px-4 py-3 text-sm font-medium flex flex-col justify-between h-full items-center text-center">
                              <span className="text-slate-600">{category.label}</span>
                              <div className="text-2xl font-bold" style={{ color: getColorByScore(score) }}>
                                {score}/100
                              </div>
                            </div>
                            <div 
                              className="absolute bottom-0 left-0 h-1 transition-all duration-300"
                              style={{ 
                                width: `${score}%`,
                                backgroundColor: color
                              }}
                            />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 rounded-[20px] p-4">
                          <h3 className="text-lg font-semibold mb-2">{category.label}</h3>
                          <p className="text-sm text-slate-600">{category.description}</p>
                        </PopoverContent>
                      </Popover>
                    )
                  })}
                </div>

                <Button
                  variant="ghost"
                  className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 w-full mt-4 rounded-xl"
                  onClick={() => toggleExpandCard(call.id)}
                >
                  {expandedCards[call.id] ? (
                    <>
                      Hide Details <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Call Details <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {expandedCards[call.id] && (
                  <div className="mt-6 p-6 bg-white rounded-[32px] shadow-sm">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Call Details</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="relative overflow-hidden border-0 bg-white rounded-[32px] shadow-lg">
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">⚡ Power Moment!</h3>
                            <p className="text-slate-900">
                              "Perfect schedule accommodation at 5:30 - Working around student's classes"
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden border-0 bg-white rounded-[32px] shadow-lg">
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Call Notes</h3>
                            <Textarea
                              placeholder="Enter your notes here..."
                              value={callNotes[call.id] || call.call_notes}
                              onChange={(e) => handleNotesChange(call.id, e.target.value)}
                              className="min-h-[100px] mb-2 rounded-[20px]"
                            />
                            <Button 
                              onClick={() => saveNotes(call.id)}
                              className="w-full rounded-[20px]"
                            >
                              Save Notes
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="relative overflow-hidden border-0 bg-white rounded-[32px] shadow-lg">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-6">
                              <span className="text-slate-900 text-xl font-semibold">Detailed Analysis</span>
                            </div>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-600">Overall Score</span>
                                <span className="text-2xl font-bold" style={{ color: getColorByScore(call.overall_effectiveness) }}>
                                  {call.overall_effectiveness}/100
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full"
                                  style={{ 
                                    width: `${call.overall_effectiveness}%`,
                                    backgroundColor: getColorByScore(call.overall_effectiveness)
                                  }}
                                />
                              </div>
                              <p className="text-slate-600">
                                Strong performance in information gathering and program explanation. 
                                Areas for improvement include engagement and objection handling.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden border-0 bg-white rounded-[32px] shadow-lg">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-6">
                              <span className="text-slate-900 text-xl font-semibold">Level Up Plan</span>
                            </div>
                            <div className="space-y-4">
                              <div className="bg-[#F5B971] text-white p-4 rounded-xl flex items-center gap-2">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 15L9 9L13 13L20 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Investor should ask clearer questions on final terms and conditions
                              </div>
                              <div className="bg-[#66C6BA] text-white p-4 rounded-xl flex items-center gap-2">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 15L9 9L13 13L20 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Clarify lease terms better with detailed explanations
                              </div>
                              <div className="bg-[#556bc7] text-white p-4 rounded-xl flex items-center gap-2">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 15L9 9L13 13L20 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Set a specific follow-up plan to keep hold times low and maintain engagement
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <Card className="relative overflow-hidden border-0 bg-white rounded-[32px] shadow-lg w-full">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-900 text-xl font-semibold">Call Recording</span>
                          </div>
                          <AudioPlayer src="/example-call.mp3" />
                        </CardContent>
                      </Card>
                      <Card className="relative overflow-hidden border-0 bg-white rounded-[32px] shadow-lg w-full">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-slate-900 text-xl font-semibold">Call Transcript</span>
                          </div>
                          <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            <div className="bg-slate-100 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6">
                                  <img
                                    src="/placeholder.svg?height=24&width=24"
                                    alt="AI Assistant"
                                    className="w-full h-full rounded-[20px]"
                                  />
                                </div>
                                <span className="text-sm text-slate-600">AI Assistant</span>
                              </div>
                              <p className="text-sm text-slate-700">Hey there. My name is Megan. I'll be waiting for your opening pitch.</p>
                            </div>
                            <div className="bg-slate-200 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6">
                                  <img
                                    src="/placeholder.svg?height=24&width=24"
                                    alt="Agent"
                                    className="w-full h-full rounded-[20px] bg-slate-300"
                                  />
                                </div>
                                <span className="text-sm text-slate-600">Agent</span>
                              </div>
                              <p className="text-sm text-slate-800">Hey, Megan. We're looking to buy your house.</p>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6">
                                  <img
                                    src="/placeholder.svg?height=24&width=24"
                                    alt="AI Assistant"
                                    className="w-full h-full rounded-[20px]"
                                  />
                                </div>
                                <span className="text-sm text-slate-600">AI Assistant</span>
                              </div>
                              <p className="text-sm text-slate-700">Oh, wow. That's actually perfect timing. I've been wondering what to do with the house. How exactly does that work?</p>
                            </div>
                            <div className="bg-slate-200 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6">
                                  <img
                                    src="/placeholder.svg?height=24&width=24"
                                    alt="Agent"
                                    className="w-full h-full rounded-[20px] bg-slate-300"
                                  />
                                </div>
                                <span className="text-sm text-slate-600">Agent</span>
                              </div>
                              <p className="text-sm text-slate-800">Well, We'll essentially send the notary you. And, uh, yeah, we'll go from there.</p>
                            </div>
                            {/* Additional transcript messages */}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 p-6 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="h-10 w-10 rounded-full"
          >
            <ChevronLeft className="h-4w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className={`h-10 w-10 rounded-full ${
                currentPage === page
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "text-slate-900 hover:bg-slate-100"
              }`}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-10 w-10 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>

        <Dialog open={detailsModal.isOpen} onOpenChange={(isOpen) => setDetailsModal({ ...detailsModal, isOpen })}>
          <DialogContent className="bg-white text-slate-900 border-0 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 text-center">
                Call Details
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-center">
                {detailsModal.call && new Date(detailsModal.call.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {detailsModal.call && Object.entries(detailsModal.call)
                    .filter(([key]) => !['id', 'created_at'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-900 capitalize">
                          {key.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-slate-600">{value}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )}
  </div>
  )
}
