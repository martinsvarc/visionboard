'use client'

import React, { useEffect, useState, useCallback, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, ChevronRight, Calendar, ChevronLeft, RefreshCw } from "lucide-react"
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
}

interface ChartDataPoint {
  name: string;
  value: number;
}

const getScoreColor = (score: number) => {
  if (score >= 95) return "#556bc7"; // Blue
  if (score >= 70) return "#22c55e"; // Green
  if (score >= 40) return "#f97316"; // Orange
  return "#ef4444"; // Red
};

const scoreCategories = [
  { key: 'engagement', label: 'Engagement', color: '#556bc7' },
  { key: 'objection_handling', label: 'Objection Handling', color: '#556bc7' },
  { key: 'information_gathering', label: 'Information Gathering', color: '#556bc7' },
  { key: 'program_explanation', label: 'Program Explanation', color: '#556bc7' },
  { key: 'closing_skills', label: 'Closing Skills', color: '#556bc7' },
  { key: 'overall_effectiveness', label: 'Overall Effectiveness', color: '#556bc7' }
] as const;
const Chart: React.FC<ChartProps> = ({ data, category, dateRange, setDateRange }) => {
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

  const handleClick = (point: ChartDataPoint | null) => {
    if (!point) {
      setSelectedPoints([]);
      setPercentageChange(null);
      return;
    }

    if (selectedPoints.length === 2) {
      setSelectedPoints([]);
      setPercentageChange(null);
    } else if (selectedPoints.length === 1) {
      if (Number(point.name) > Number(selectedPoints[0].name)) {
        const newSelectedPoints = [...selectedPoints, point].sort((a, b) => 
          Number(a.name) - Number(b.name)
        );
        setSelectedPoints(newSelectedPoints);
        const change = ((newSelectedPoints[1].value - newSelectedPoints[0].value) / 
          newSelectedPoints[0].value) * 100;
        setPercentageChange(change.toFixed(2));
      } else {
        setSelectedPoints([]);
        setPercentageChange(null);
      }
    } else {
      setSelectedPoints([point]);
    }
  };

  interface CustomDotProps {
    cx: number;
    cy: number;
    payload: ChartDataPoint;
  }

  const CustomizedDot = (props: CustomDotProps) => {
    const { cx, cy, payload } = props;
    const isSelected = selectedPoints.some(point => point.name === payload.name);
    
    if (isSelected) {
      return (
        <circle 
          cx={cx} 
          cy={cy} 
          r={6} 
          fill={category ? category.color : "#10B981"} 
          stroke="#FFFFFF" 
          strokeWidth={2} 
        />
      );
    }
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={0} 
        fill="none" 
      />
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 text-white p-2 rounded-lg text-sm">
          <p>{`Call ${label}: ${payload[0].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };
return (
<Card className="relative overflow-hidden border-0 bg-white rounded-[32px] shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-slate-900 text-xl font-semibold">
            {category ? category.label : 'Overall Performance'}
          </span>
          {!category && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
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
                style={{ zIndex: 9999 }}
              >
                <div className="flex flex-col space-y-4 p-4">
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
  modifiers={{
    selected: (date) => {
      if (!dateRange?.from || !dateRange?.to) return false;
      return (
        date.getTime() === dateRange.from.getTime() ||
        date.getTime() === dateRange.to.getTime()
      );
    }
  }}
  modifiersStyles={{
    selected: {
      backgroundColor: 'rgb(15 23 42)',
      color: 'white'
    }
  }}
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
                    <Button
                      variant="outline"
                      className="w-full justify-center text-center font-normal rounded-xl h-11 hover:bg-slate-100"
                      onClick={() => {
                        const end = new Date();
                        const start = subDays(end, 7);
                        setDateRange({ from: start, to: end });
                      }}
                    >
                      Last 7 Days
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-center text-center font-normal rounded-xl h-11 hover:bg-slate-100"
                      onClick={() => {
                        const end = endOfMonth(new Date());
                        const start = startOfMonth(new Date());
                        setDateRange({ from: start, to: end });
                      }}
                    >
                      This Month
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-center text-center font-normal rounded-xl h-11 hover:bg-slate-100"
                      onClick={() => {
                        const end = new Date();
                        const start = subDays(end, 14);
                        setDateRange({ from: start, to: end });
                      }}
                    >
                      Last 14 Days
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-center text-center font-normal rounded-xl h-11 hover:bg-slate-100"
                      onClick={() => {
                        const end = new Date();
                        const start = subDays(end, 30);
                        setDateRange({ from: start, to: end });
                      }}
                    >
                      Last 30 Days
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <div className="h-[240px] relative">
          {chartData.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <span className="text-slate-600 text-xl">No calls found</span>
              <Button variant="outline" onClick={() => setDateRange({ from: null, to: null })}>View all time</Button>
            </div>
          )}
          {chartData.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={chartData} 
                  margin={{ top: 20, right: 0, bottom: 0, left: -32 }}
                  onClick={(data) => data && data.activePayload 
                    ? handleClick(data.activePayload[0].payload) 
                    : handleClick(null)}
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
                  <RechartsTooltip content={<CustomTooltip />} />
                <Area 
  type="monotone" 
  dataKey="value" 
  stroke={getScoreColor(latestValue ?? 0)}
  strokeWidth={3}
  fill={`url(#colorGradient-${category ? category.key : 'overall'})`}
  dot={CustomizedDot}
  activeDot={{ r: 8, fill: getScoreColor(latestValue ?? 0), stroke: '#FFFFFF', strokeWidth: 2 }}
/>
                  {selectedPoints.length > 1 && percentageChange !== null && (
                    <ReferenceLine
                      segment={selectedPoints.map(point => ({ x: point.name, y: point.value }))}
                      stroke="rgba(0, 0, 0, 0.2)"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      label={<CustomizedLabel 
                        value={percentageChange}
                        viewBox={{
                          x: Math.min(Number(selectedPoints[0].name), Number(selectedPoints[1].name)),
                          y: Math.min(selectedPoints[0].value, selectedPoints[1].value),
                          width: Math.abs(Number(selectedPoints[1].name) - Number(selectedPoints[0].name))
                        }} 
                      />}
                    />
                  )}
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
  );
};
function DashboardComponent() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [filteredCallLogs, setFilteredCallLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });

  const [playCallModal, setPlayCallModal] = useState<{
    isOpen: boolean;
    callId: number | null;
  }>({ isOpen: false, callId: null });
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    call: CallLog | null;
  }>({ isOpen: false, call: null });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const searchParams = useSearchParams();
  const memberId = searchParams.get('memberId');

  const fetchCallLogs = useCallback(async () => {
    if (!memberId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard?memberId=${memberId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch call logs');
      }

      setCallLogs(data);
      setFilteredCallLogs(data);
    } catch (err) {
      console.error('Error fetching call logs:', err);
      setError('Failed to fetch call logs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const filtered = callLogs.filter(call => {
        const callDate = new Date(call.call_date);
        return callDate >= dateRange.from! && callDate <= dateRange.to!;
      });
      setFilteredCallLogs(filtered);
    } else {
      setFilteredCallLogs(callLogs);
    }
  }, [callLogs, dateRange]);

  const handlePlayCall = (callId: number) => {
    setPlayCallModal({ isOpen: true, callId });
  };

  const handleViewDetails = (call: CallLog) => {
    setDetailsModal({ isOpen: true, call });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchCallLogs}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
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
                      <div className="text-6xl font-bold mt-4" style={{ color: getScoreColor(call.scores.overall_effectiveness) }}>
  {call.scores.overall_effectiveness}
  <span className="text-2xl text-slate-600">/100</span>
</div>
<p className="text-lg" style={{ color: getScoreColor(call.scores.overall_effectiveness) }}>Overall Effectiveness</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Popover>
  <PopoverTrigger asChild>
    <Button className="w-full">
      <Play className="mr-2 h-4 w-4" /> Play Call
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-[300px] p-4 bg-white shadow-md rounded-md border" sideOffset={5}>
    <div className="flex flex-col items-center space-y-4">
      <h3 className="text-lg font-semibold">Call Recording</h3>
      <audio controls className="w-full">
        <source 
          src={call.call_recording_url} 
          type="audio/mpeg" 
        />
        Your browser does not support the audio element.
      </audio>
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
                      <Popover>
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
  <PopoverContent className="w-80 bg-white p-4 rounded-xl shadow-xl">
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-900">{label}</h3>
      <div className="text-6xl font-bold text-center text-[#556bc7] my-4">
        {call.scores[key as keyof typeof call.scores]}
        <span className="text-2xl text-slate-600">/100</span>
      </div>
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
