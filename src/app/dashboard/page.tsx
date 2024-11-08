'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, ChevronRight, Calendar, ChevronLeft, RefreshCw } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useSearchParams } from 'next/navigation'
import { TooltipProvider, TooltipContent, TooltipTrigger, Tooltip } from "@/components/ui/tooltip"

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

const scoreCategories = [
  { key: 'engagement', label: 'Engagement', color: '#556bc7' },
  { key: 'objection_handling', label: 'Objection Handling', color: '#556bc7' },
  { key: 'information_gathering', label: 'Information Gathering', color: '#556bc7' },
  { key: 'program_explanation', label: 'Program Explanation', color: '#556bc7' },
  { key: 'closing_skills', label: 'Closing Skills', color: '#556bc7' },
  { key: 'overall_effectiveness', label: 'Overall Effectiveness', color: '#556bc7' }
]

const Chart = ({ data, category, dateRange, setDateRange }) => {
  const [selectedPoints, setSelectedPoints] = useState([])
  const [percentageChange, setPercentageChange] = useState(null)

  const chartData = data.filter((item) => {
    if (!dateRange || !dateRange.from || !dateRange.to) return true;
    const itemDate = new Date(item.call_date);
    return itemDate >= dateRange.from && itemDate <= dateRange.to;
  }).map((item, index) => ({
    name: String(index + 1),
    value: category ? item.scores[category.key] : item.scores.overall_effectiveness
  }))

  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : null

  const handleClick = (point) => {
    if (!point) {
      setSelectedPoints([])
      setPercentageChange(null)
      return
    }

    if (selectedPoints.length === 2) {
      setSelectedPoints([])
      setPercentageChange(null)
    } else if (selectedPoints.length === 1) {
      if (point.name > selectedPoints[0].name) {
        const newSelectedPoints = [...selectedPoints, point].sort((a, b) => a.name - b.name)
        setSelectedPoints(newSelectedPoints)
        const change = ((newSelectedPoints[1].value - newSelectedPoints[0].value) / newSelectedPoints[0].value) * 100
        setPercentageChange(change.toFixed(2))
      } else {
        setSelectedPoints([])
        setPercentageChange(null)
      }
    } else {
      setSelectedPoints([point])
    }
  }

  const CustomizedDot = ({ cx, cy, payload }) => {
    const isSelected = selectedPoints.some(point => point.name === payload.name)
    if (isSelected) {
      return (
        <circle cx={cx} cy={cy} r={6} fill={category ? category.color : "#10B981"} stroke="#FFFFFF" strokeWidth={2} />
      )
    }
    return null
  }

  const CustomTooltip = ({ active, payload, label }) => {
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
          <span className="text-slate-900 text-xl font-semibold">{category ? category.label : 'Overall Performance'}</span>
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
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 20, right: 0, bottom: 0, left: -32 }}
              onClick={(data) => handleClick(data && data.activePayload ? data.activePayload[0].payload : null)}
            >
              <defs>
                <linearGradient id={`colorGradient-${category ? category.key : 'overall'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={category ? category.color : "#F59E0B"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={category ? category.color : "#F59E0B"} stopOpacity={0.1}/>
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
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={category ? category.color : "#F59E0B"}
                strokeWidth={3}
                fill={`url(#colorGradient-${category ? category.key : 'overall'})`}
                dot={<CustomizedDot />}
                activeDot={{ r: 8, fill: category ? category.color : "#F59E0B", stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Component() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [filteredCallLogs, setFilteredCallLogs] = useState<CallLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [activeModal, setActiveModal] = useState({ isOpen: false, category: null, value: null, feedback: null })
  const [playCallModal, setPlayCallModal] = useState({ isOpen: false, callId: null })
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, call: null })
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 10

  const searchParams = useSearchParams()
  const memberId = searchParams.get('memberId')

  const fetchCallLogs = useCallback(async () => {
    if (!memberId) return;
    
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/dashboard?memberId=${memberId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch call logs')
      }

      setCallLogs(data)
      setFilteredCallLogs(data)
    } catch (err) {
      console.error('Error fetching call logs:', err)
      setError('Failed to fetch call logs. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    fetchCallLogs()
  }, [fetchCallLogs])

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const filtered = callLogs.filter(call => {
        const callDate = new Date(call.call_date)
        return callDate >= dateRange.from && callDate <= dateRange.to
      })
      setFilteredCallLogs(filtered)
    } else {
      setFilteredCallLogs(callLogs)
    }
  }, [callLogs, dateRange])

  const handlePlayCall = (callId: number) => {
    setPlayCallModal({ isOpen: true, callId })
  }

  const handleViewDetails = (call: CallLog) => {
    setDetailsModal({ isOpen: true, call })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
      </div>
    )
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
    )
  }

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredCallLogs.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredCallLogs.length / recordsPerPage)

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
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
          {currentRecords.map((call, index) => (
            <Card key={call.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border-0">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Agent Info Section */}
                  <div className="md:w-1/3 space-y-4">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={call.agent_picture_url} />
                        <AvatarFallback>{call.agent_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-2xl font-bold text-slate-900">{call.agent_name}</h3>
                      <p className="text-lg text-slate-600">CALL NUMBER {call.call_number}</p>
                      <p className="text-sm text-slate-600">
                        {format(new Date(call.call_date), 'PPpp')}
                      </p>
                      <div className="text-6xl font-bold text-[#556bc7] mt-4">
                        {call.scores.overall_effectiveness}
                        <span className="text-2xl text-slate-600">/100</span>
                      </div>
                      <p className="text-lg text-slate-600">Overall Effectiveness</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        className="w-full"
                        onClick={() => handlePlayCall(call.id)}
                      >
                        <Play className="mr-2 h-4 w-4" /> Play Call
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewDetails(call)}
                      >
                        View Details <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
</div>

                  {/* Scores Grid */}
                  <div className="md:w-2/3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {scoreCategories.map(({ key, label }) => (
                        <button 
                          key={key}
                          onClick={() => setActiveModal({ 
                            isOpen: true, 
                            category: key, 
                            value: call.scores[key],
                            feedback: call.feedback[key]
                          })}
                          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                        >
                          <div className="text-sm font-medium text-slate-600 text-center mb-2">
                            {label}
                          </div>
                          <div className="text-4xl font-bold text-center text-[#556bc7]">
                            {call.scores[key]}
                            <span className="text-lg text-slate-600">/100</span>
                          </div>
                        </button>
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

      {/* Score Detail Modal */}
      <Dialog open={activeModal.isOpen} onOpenChange={(isOpen) => setActiveModal({ ...activeModal, isOpen })}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{scoreCategories.find(c => c.key === activeModal.category)?.label}</DialogTitle>
            <DialogDescription>
              <div className="text-6xl font-bold text-center text-[#556bc7] my-4">
                {activeModal.value}
                <span className="text-2xl text-slate-600">/100</span>
              </div>
              <p className="text-slate-600 whitespace-pre-line">
                {activeModal.feedback}
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Play Call Modal */}
      <Dialog open={playCallModal.isOpen} onOpenChange={(isOpen) => setPlayCallModal({ ...playCallModal, isOpen })}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Call Recording</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-4">
            <audio controls className="w-full">
              <source 
                src={callLogs.find(call => call.id === playCallModal.callId)?.call_recording_url} 
                type="audio/mpeg" 
              />
              Your browser does not support the audio element.
            </audio>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Details Modal */}
      <Dialog open={detailsModal.isOpen} onOpenChange={(isOpen) => setDetailsModal({ ...detailsModal, isOpen })}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-slate-600">
              {detailsModal.call?.call_details}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
