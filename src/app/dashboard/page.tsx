'use client'

import React, { useEffect, useState, useCallback, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TooltipProps as RechartsTooltipProps } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts'
import { Tooltip as RechartsTooltip } from 'recharts'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useSearchParams } from 'next/navigation'
import { TooltipProvider, TooltipContent, TooltipTrigger, Tooltip } from "@/components/ui/tooltip"
import { DateRange } from "react-day-picker"
import './calendar.css' 
import { Slider } from "@/components/ui/slider"
import { Play, Pause, ChevronRight, Calendar, ChevronLeft, RefreshCw, SkipBack, SkipForward, PlayCircle } from "lucide-react"

interface CallLog {
  id: number;
  call_number: number;
  agent_name: string;
  agent_picture_url: string;
  call_date: string;
  call_recording_url: string;
  call_details: string;
  scores: {
    engagement: number;
    objection_handling: number;
    information_gathering: number;
    program_explanation: number;
    closing_skills: number;
    overall_effectiveness: number;
    overall_performance: number;
    average_success: number;
  };
  feedback: {
    engagement: string;
    objection_handling: string;
    information_gathering: string;
    program_explanation: string;
    closing_skills: string;
    overall_effectiveness: string;
  };
  descriptions: CategoryDescriptions;
}

interface CategoryDescriptions {
  engagement: string;
  objection_handling: string;
  information_gathering: string;
  program_explanation: string;
  closing_skills: string;
  overall_effectiveness: string;
  overall_performance: string;
}

interface AudioPlayerProps {
  audioSrc: string;
  caller: string;
}

interface Category {
  key: string;
  label: string;
  color: string;
}

interface ChartProps {
  data: CallLog[];
  category?: Category;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  filteredCallLogs: CallLog[];
}

interface ChartDataPoint {
  name: string;
  value: number;
}

const CustomTooltip: React.FC<RechartsTooltipProps<number, string>> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0];
  if (!data || typeof data.value !== 'number') {
    return null;
  }

  return (
    <div className="bg-black/80 text-white p-2 rounded-lg text-sm">
      <p>{`Call ${data.name}: ${data.value.toFixed(1)}%`}</p>
    </div>
  );
};

const getScoreColor = (score: number) => {
  if (score >= 95) return "#22c55e"; 
  if (score >= 70) return "#556bc7"; 
  if (score >= 40) return "#f97316"; 
  return "#ef4444"; // Red
};

const formatTime = (time: number) => {
  if (!time) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const scoreCategories = [
  { key: 'engagement', label: 'Engagement', color: '#556bc7' },
  { key: 'objection_handling', label: 'Objection Handling', color: '#556bc7' },
  { key: 'information_gathering', label: 'Information Gathering', color: '#556bc7' },
  { key: 'program_explanation', label: 'Program Explanation', color: '#556bc7' },
  { key: 'closing_skills', label: 'Closing Skills', color: '#556bc7' },
  { key: 'overall_effectiveness', label: 'Overall Effectiveness', color: '#556bc7' }
] as const;

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, caller }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      <h3 className="text-xl font-semibold text-center">Call with {caller}</h3>
      <div className="w-full">
        <div className="flex justify-between mb-1 text-sm text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleSliderChange}
          className="w-full"
        />
      </div>
      <div className="flex justify-center items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full h-8 w-8 p-0"
          onClick={() => audioRef.current && (audioRef.current.currentTime -= 10)}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full h-8 w-8 p-0"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full h-8 w-8 p-0"
          onClick={() => audioRef.current && (audioRef.current.currentTime += 10)}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

  interface CustomizedLabelProps {
    value: string;
    viewBox: {
      x: number;
      y: number;
      width: number;
    };
  }

  const CustomizedLabel = ({ value, viewBox }: CustomizedLabelProps) => {
    const { x, y, width } = viewBox;
    const centerX = x + width / 2;
    const centerY = y;
    const numericValue = parseFloat(value);

    return (
      <g>
        <rect 
          x={centerX - 30} 
          y={centerY - 12} 
          width="60" 
          height="24" 
          fill="rgba(0, 0, 0, 0.7)" 
          rx="4" 
          ry="4" 
        />
        <text 
          x={centerX} 
          y={centerY + 4} 
          textAnchor="middle" 
          fill="#ffffff" 
          fontSize="12"
          fontWeight="500"
        >
          {numericValue > 0 ? `+${value}%` : `${value}%`}
        </text>
      </g>
    );
  };

const Chart: React.FC<ChartProps> = ({ data, category, dateRange, setDateRange, filteredCallLogs }) => {
  const [selectedPoints, setSelectedPoints] = useState<ChartDataPoint[]>([]);
  const [percentageChange, setPercentageChange] = useState<string | null>(null);

  const chartData = data.filter((item) => {
    if (!dateRange || !dateRange.from || !dateRange.to) return true;
    const itemDate = new Date(item.call_date);
    return itemDate >= dateRange.from && itemDate <= dateRange.to;
  }).map((item, index) => ({
    name: String(index + 1),
    value: category ? item.scores[category.key as keyof typeof item.scores] : item.scores.overall_effectiveness
  }));

  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : null;

  // Static descriptions
  const staticDescriptions = {
    engagement: "This metric evaluates the agent's ability to connect with customers and maintain meaningful interactions throughout the call.",
    objection_handling: "This score reflects how well the agent addresses customer concerns and manages challenging situations.",
    information_gathering: "This metric assesses the agent's proficiency in collecting relevant information and asking appropriate questions.",
    program_explanation: "This score evaluates how effectively the agent communicates program details and complex information.",
    closing_skills: "This metric measures the agent's ability to guide conversations toward positive outcomes.",
    overall_effectiveness: "This comprehensive metric evaluates the agent's overall impact and success in handling calls."
  };

  const getCategoryDescription = (key: string) => {
    return {
      static: staticDescriptions[key as keyof typeof staticDescriptions] || "",
      dynamic: filteredCallLogs[0]?.descriptions[key as keyof CategoryDescriptions] || ""
    };
  };

  const getOverallDescription = () => {
    return {
      static: "This comprehensive score represents the agent's overall performance across all measured metrics.",
      dynamic: filteredCallLogs[0]?.descriptions.overall_performance || ""
    };
  };

  return (
    <div className="relative w-full">
      {!category && (
        <div className="absolute right-4 top-4" style={{ zIndex: 50 }}>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                onClick={(e) => e.stopPropagation()}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
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
              <div className="flex flex-col space-y-4 p-4" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  className="w-full justify-center text-center font-normal col-span-2"
                  onClick={() => setDateRange({ from: null, to: null })}
                >
                  All time
                </Button>
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from || new Date()}
                  selected={{
                    from: dateRange?.from ? new Date(dateRange.from) : undefined,
                    to: dateRange?.to ? new Date(dateRange.to) : undefined
                  }}
                  onSelect={(range: DateRange | undefined) => {
                    setDateRange({
                      from: range?.from || null,
                      to: range?.to || null
                    });
                  }}
                  numberOfMonths={2}
                  className="bg-white [&_.rdp]:p-0 [&_.rdp-months]:space-x-4 [&_.rdp-month]:w-full [&_.rdp-day]:h-10 [&_.rdp-day]:w-10 [&_.rdp-day]:text-sm [&_.rdp-day]:font-normal [&_.rdp-day_span]:flex [&_.rdp-day_span]:h-full [&_.rdp-day_span]:w-full [&_.rdp-day_span]:items-center [&_.rdp-day_span]:justify-center [&_.rdp-day]:hover:bg-slate-100 [&_.rdp-day_button]:font-normal [&_.rdp-button]:hover:bg-slate-100 [&_.rdp-nav_button]:h-9 [&_.rdp-nav_button]:w-9 [&_.rdp-nav_button]:bg-transparent [&_.rdp-nav_button]:hover:bg-slate-100 [&_.rdp-head_cell]:font-normal [&_.rdp-head_cell]:text-slate-500 [&_.rdp-caption_label]:font-medium [&_.rdp-caption_label]:text-slate-900 [&_.rdp-day_selected]:bg-slate-900 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected]:hover:bg-slate-900 [&_.rdp-day_selected]:hover:text-white [&_.rdp-day_range_start]:bg-slate-900 [&_.rdp-day_range_start]:text-white [&_.rdp-day_range_start]:hover:bg-slate-900 [&_.rdp-day_range_start]:hover:text-white [&_.rdp-day_range_end]:bg-slate-900 [&_.rdp-day_range_end]:text-white [&_.rdp-day_range_end]:hover:bg-slate-900 [&_.rdp-day_range_end]:hover:text-white [&_.rdp-day_range_middle]:bg-slate-100 [&_.rdp-day_today]:font-bold"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="w-full justify-center text-center font-normal rounded-xl h-11 hover:bg-slate-100"
                    onClick={() => {
                      const end = new Date();
                      const start = startOfWeek(end);
                      setDateRange({ from: start, to: end });
                    }}
                  >
                    This Week
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center text-center font-normal rounded-xl h-11 hover:bg-slate-100"
                    onClick={() => {
                      const end = subDays(startOfWeek(new Date()), 1);
                      const start = startOfWeek(end);
                      setDateRange({ from: start, to: end });
                    }}
                  >
                    Last Week
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Card className="relative overflow-hidden border-0 bg-white rounded-[32px] shadow-lg hover:shadow-xl transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-900 text-xl font-semibold">
                  {category ? category.label : 'Overall Performance'}
                </span>
              </div>
              <div className="h-[240px] relative">
                {chartData.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <span className="text-slate-600 text-xl">No calls found</span>
                    <Button variant="outline" onClick={() => setDateRange({ from: null, to: null })}>
                      View all time
                    </Button>
                  </div>
                )}
                {chartData.length > 0 && (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={chartData} 
                        margin={{ top: 20, right: 0, bottom: 0, left: -32 }}
                      >
                        <defs>
                          <linearGradient id={`colorGradient-${category ? category.key : 'overall'}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={getScoreColor(latestValue ?? 0)} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={getScoreColor(latestValue ?? 0)} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 10 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 10 }} 
                          domain={[0, 100]} 
                        />
                        <RechartsTooltip content={CustomTooltip} />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={getScoreColor(latestValue ?? 0)}
                          strokeWidth={3}
                          fill={`url(#colorGradient-${category ? category.key : 'overall'})`}
                          activeDot={{ r: 8, fill: getScoreColor(latestValue ?? 0), stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ zIndex: 0 }}>
                      <div className="text-lg text-slate-600 mb-2">Average Score</div>
                      <div className="text-6xl font-bold tracking-tight" style={{ color: getScoreColor(latestValue ?? 0) }}>
                        {Math.round(latestValue ?? 0)}<span className="text-4xl">/100</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] bg-white p-6 rounded-xl shadow-xl">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">
              {category ? `${category.label} Analysis` : 'Overall Performance Analysis'}
            </h3>
            <p className="text-slate-600 text-sm italic">
              {category ? getCategoryDescription(category.key).static : getOverallDescription().static}
            </p>
            <div className="text-6xl font-bold text-center" style={{ color: getScoreColor(latestValue ?? 0) }}>
              {Math.round(latestValue ?? 0)}<span className="text-2xl text-slate-600">/100</span>
            </div>
            <p className="text-slate-600">
              {category ? getCategoryDescription(category.key).dynamic : getOverallDescription().dynamic}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredCallLogs.slice().reverse().slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredCallLogs.length / recordsPerPage);

  return (
  <div className="min-h-screen pt-12 px-8 bg-[#f2f3f8]">
    <div className="max-w-7xl mx-auto space-y-8 bg-white rounded-[32px] p-8 shadow-lg">
        {/* Overall Performance Chart */}
        <Chart 
  data={filteredCallLogs} 
  dateRange={dateRange} 
  setDateRange={setDateRange}
  filteredCallLogs={filteredCallLogs}
/>

        {/* Category Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {scoreCategories.map((category) => (
    <Chart 
      key={category.key}
      data={filteredCallLogs} 
      category={category}
      dateRange={dateRange} 
      setDateRange={setDateRange}
      filteredCallLogs={filteredCallLogs}
    />
  ))}
</div>

        {/* Call Records */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-slate-900">
            CALL RECORDS
          </h2>
          {currentRecords.map((call) => (
<Card key={call.id} className="bg-white rounded-[32px] shadow-lg overflow-hidden border-0">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Agent Info Section */}
                  <div className="md:w-1/3 space-y-4">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={call.agent_picture_url} alt={call.agent_name} />
                        <AvatarFallback>{call.agent_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-2xl font-bold text-slate-900">{call.agent_name}</h3>
                      <p className="text-lg text-slate-600">CALL NUMBER {call.call_number}</p>
                      <p className="text-sm text-slate-600">
                        {format(new Date(call.call_date), 'PPpp')}
                      </p>
<Popover>
  <PopoverTrigger asChild>
    <button 
      className="relative w-full text-center cursor-pointer hover:opacity-90 transition-opacity"
    >
      <div className="text-6xl font-bold" style={{ color: getScoreColor(call.scores.overall_performance) }}>
        {call.scores.overall_performance}
        <span className="text-2xl text-slate-600">/100</span>
      </div>
      <p className="text-lg" style={{ color: getScoreColor(call.scores.overall_performance) }}>Overall Performance</p>
    </button>
  </PopoverTrigger>
  <PopoverContent className="w-[600px] bg-white p-6 rounded-xl shadow-xl">
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900">Overall Performance Analysis</h3>
      
      {/* Score Display */}
      <div className="text-6xl font-bold text-center" style={{ color: getScoreColor(call.scores.overall_performance) }}>
        {call.scores.overall_performance}
        <span className="text-2xl text-slate-600">/100</span>
      </div>

      {/* Performance Analysis Text */}
      <div className="text-slate-600 space-y-4">
        <p>This overall performance score is calculated based on a comprehensive evaluation of all key performance indicators:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Engagement: {call.scores.engagement}%</li>
          <li>Objection Handling: {call.scores.objection_handling}%</li>
          <li>Information Gathering: {call.scores.information_gathering}%</li>
          <li>Program Explanation: {call.scores.program_explanation}%</li>
          <li>Closing Skills: {call.scores.closing_skills}%</li>
          <li>Overall Effectiveness: {call.scores.overall_effectiveness}%</li>
        </ul>
        <p className="mt-4">
        </p>
      </div>
    </div>
  </PopoverContent>
</Popover>
                    </div>
                    <div className="flex flex-col gap-2">
  <Popover>
    <PopoverTrigger asChild>
      <Button className="w-full">
        <Play className="mr-2 h-4 w-4" /> Play Call
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[300px] p-4 bg-white shadow-md rounded-md border" sideOffset={5}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Call with {call.agent_name}</h2>
        <audio
          src={call.call_recording_url}
          ref={(audio) => {
            if (audio) {
              audio.addEventListener('timeupdate', () => {
                const progress = (audio.currentTime / audio.duration) * 100;
                const progressBar = audio.parentElement?.querySelector('.progress-bar') as HTMLElement;
                const progressThumb = audio.parentElement?.querySelector('.progress-thumb') as HTMLElement;
                const currentTimeEl = audio.parentElement?.querySelector('.current-time') as HTMLElement;
                const durationEl = audio.parentElement?.querySelector('.duration') as HTMLElement;
                
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressThumb) progressThumb.style.left = `${progress}%`;
                if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
                if (durationEl) durationEl.textContent = formatTime(audio.duration);
              });
            }
          }}
          className="hidden"
        />
        <div className="flex justify-center gap-4">
          <button 
            className="p-2 rounded border hover:bg-gray-100"
            onClick={(e) => {
              const audio = (e.currentTarget.parentElement?.parentElement?.querySelector('audio')) as HTMLAudioElement;
              if (audio) audio.currentTime -= 10;
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
  className="p-2 rounded border hover:bg-gray-100"
  onClick={(e) => {
    const audio = (e.currentTarget.parentElement?.parentElement?.querySelector('audio')) as HTMLAudioElement;
    const playIcon = (e.currentTarget.querySelector('svg') as unknown) as HTMLElement;
    const pauseIcon = e.currentTarget.querySelector('.pause') as HTMLElement;
    
    if (audio) {
      if (audio.paused) {
        audio.play();
        playIcon?.classList.add('hidden');
        pauseIcon?.classList.remove('hidden');
      } else {
        audio.pause();
        playIcon?.classList.remove('hidden');
        pauseIcon?.classList.add('hidden');
      }
    }
  }}
>
  <Play className="h-5 w-5" />
  <Pause className="h-5 w-5 hidden pause" />
</button>
          <button 
            className="p-2 rounded border hover:bg-gray-100"
            onClick={(e) => {
              const audio = (e.currentTarget.parentElement?.parentElement?.querySelector('audio')) as HTMLAudioElement;
              if (audio) audio.currentTime += 10;
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div 
          className="w-full bg-gray-100 h-1 rounded-full relative cursor-pointer"
          onClick={(e) => {
            const audio = (e.currentTarget.parentElement?.querySelector('audio')) as HTMLAudioElement;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const progress = (x / rect.width) * 100;
            if (audio) audio.currentTime = (progress / 100) * audio.duration;
          }}
        >
          <div className="progress-bar absolute left-0 h-1 bg-blue-500 rounded-full" />
          <div className="progress-thumb absolute -left-1.5 h-3 w-3 bg-blue-500 rounded-full top-1/2 -translate-y-1/2" />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span className="current-time">0:00</span>
          <span className="duration">0:00</span>
        </div>
      </div>
    </PopoverContent>
  </Popover>

<Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full">
        View Details <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[300px] p-4 bg-white shadow-md rounded-md border" sideOffset={5}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Call Details</h3>
        <div className="text-sm text-slate-600">
          {call.call_details}
        </div>
      </div>
    </PopoverContent>
  </Popover>
</div>
  </div>                  

{/* Scores Grid */}
<div className="md:w-2/3">
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {scoreCategories.map(({ key, label }) => (
      <Popover key={key}>
        <PopoverTrigger asChild>
          <button 
            className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow w-full h-48 relative"
          >
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full">
              <div className="text-base font-medium text-slate-600 text-center">
                {label}
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full">
              <div className="flex items-baseline justify-center">
                <span 
                  className="text-5xl font-bold" 
                  style={{ color: getScoreColor(call.scores[key as keyof typeof call.scores]) }}
                >
                  {call.scores[key as keyof typeof call.scores]}
                </span>
                <span className="text-xl text-slate-600 ml-1">/100</span>
              </div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] bg-white p-6 rounded-xl shadow-xl">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">{label}</h3>
            
            {/* Score Display */}
            <div className="text-6xl font-bold text-center" style={{ color: getScoreColor(call.scores[key as keyof typeof call.scores]) }}>
              {call.scores[key as keyof typeof call.scores]}
              <span className="text-2xl text-slate-600">/100</span>
            </div>

            {/* Feedback Text */}
            <p className="text-slate-600 whitespace-pre-line">
              {call.feedback[key as keyof typeof call.feedback]}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    ))}
  </div>
</div>
                </div>
              </CardContent>
            </Card>
          ))}
{/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-10 w-10 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                onClick={() => setCurrentPage(page)}
                className="h-10 w-10 p-0"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="ghost"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-10 w-10 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            </div>
        </div>
      </div>
    </div>
  );
}

// Export the wrapped version
export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    }>
      <DashboardComponent />
    </Suspense>
  );
}
