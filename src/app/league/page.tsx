"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps
} from "recharts"

type LeagueData = {
  user_name: string;
  total_points: number;
  call_count: number;
  last_call_date: string;
  score_history: number[];
  rank: number;
  profile_picture_url: string;
}

type CategoryNames = {
  [key: string]: string
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-[12px] border border-gray-200 bg-white p-2 shadow-lg">
        <p className="text-xs text-gray-600">
          {`${payload[0].value?.toLocaleString()} points`}
        </p>
      </div>
    );
  }
  return null;
};

const categoryNames: CategoryNames = {
  daily: "Daily Leaderboard",
  weekly: "Weekly Leaderboard",
  monthly: "Monthly Leaderboard",
}

export default function Component() {
  const [category, setCategory] = React.useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [leagueData, setLeagueData] = React.useState<LeagueData[]>([])
  const [chartData, setChartData] = React.useState<{ date: string; points: number }[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchLeaderboardData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/league?period=${category}`)
      if (!response.ok) throw new Error('Failed to fetch leaderboard data')
      const data = await response.json()
      setLeagueData(data.leaderboard)
      setChartData(data.chartData)
    } catch (err) {
      console.error('Error fetching leaderboard data:', err)
      setError('Failed to fetch leaderboard data')
    }
    setIsLoading(false)
  }

  React.useEffect(() => {
    fetchLeaderboardData()
  }, [category])

  const getGlowColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'shadow-[0_0_20px_rgba(255,215,0,0.6)] border-2 border-yellow-400 bg-yellow-500/20'
      case 2:
        return 'shadow-[0_0_20px_rgba(192,192,192,0.6)] border-2 border-gray-300 bg-gray-400/20'
      case 3:
        return 'shadow-[0_0_20px_rgba(205,127,50,0.6)] border-2 border-yellow-600 bg-yellow-700/20'
      default:
        return ''
    }
  }

  const getCurrentUserPoints = () => {
    const topUser = leagueData[0]
    return topUser ? topUser.total_points : 0
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'ring-[#fbb350] shadow-[0_0_15px_rgba(255,179,82,0.3)]'
      case 2:
        return 'ring-[#556bc7] shadow-[0_0_15px_rgba(85,107,199,0.3)]'
      case 3:
        return 'ring-[#51c1a9] shadow-[0_0_15px_rgba(81,193,169,0.3)]'
      default:
        return 'ring-white/50'
    }
  }

  return (
    <div className="min-h-screen w-full bg-white p-4 flex items-center justify-center">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;800&display=swap');
      `}</style>
      <div className="w-full max-w-3xl bg-[#f2f3f9] rounded-[32px] p-6 shadow-lg">
        <Card className="bg-white border-0 shadow-none font-['Montserrat']">
          <CardHeader className="flex flex-col gap-4 pb-0">
            <div className="flex flex-col items-center justify-center mb-2">
              <CardTitle className="text-2xl font-extrabold text-[#556bc7] mb-1 text-center">
                Top Score in {categoryNames[category]}
              </CardTitle>
              <div className="text-5xl font-extrabold text-[#556bc7]">
                {getCurrentUserPoints().toLocaleString()}
              </div>
            </div>
            <Tabs value={category} onValueChange={(value) => setCategory(value as 'daily' | 'weekly' | 'monthly')} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-[16px]">
                <TabsTrigger 
                  value="daily" 
                  className="font-medium text-sm text-gray-600 data-[state=active]:bg-[#fbb350] data-[state=active]:text-white rounded-[12px]"
                >
                  Daily
                </TabsTrigger>
                <TabsTrigger 
                  value="weekly" 
                  className="font-medium text-sm text-gray-600 data-[state=active]:bg-[#fbb350] data-[state=active]:text-white rounded-[12px]"
                >
                  Weekly
                </TabsTrigger>
                <TabsTrigger 
                  value="monthly" 
                  className="font-medium text-sm text-gray-600 data-[state=active]:bg-[#fbb350] data-[state=active]:text-white rounded-[12px]"
                >
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="h-[160px] w-full bg-gray-100 rounded-[16px] p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#51c1a9" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#51c1a9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#51c1a9" stopOpacity={1} />
                      <stop offset="95%" stopColor="#51c1a9" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#333', fontSize: 11 }}
                    dy={5}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#333', fontSize: 11 }}
                    dx={-10}
                  />
                  <Tooltip content={CustomTooltip} />
                  <Area
                    type="monotone"
                    dataKey="points"
                    stroke="url(#lineGradient)"
                    strokeWidth={2}
                    fill="url(#colorPoints)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {isLoading ? (
              <div className="text-gray-600 text-center">Loading...</div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : (
              <div className="space-y-2">
                {leagueData.map((user, index) => {
                  const rank = user.rank;
                  const rankColor = getRankColor(rank);
                  const isAgent45 = user.user_name.toLowerCase() === 'agent45';
                  
                  return (
                    <div 
                      key={index}
                      className={`
                        flex items-center gap-3 p-3 rounded-[16px] 
                        ${rank <= 3 ? 'bg-gray-100' : 'bg-white hover:bg-gray-100'}
                        transition-all duration-300
                      `}
                    >
                      <div className="flex-none w-12 text-sm font-medium">
                        {rank === 1 ? (
                          <span className="text-[#fbb350]">#{rank}</span>
                        ) : rank === 2 ? (
                          <span className="text-[#556bc7]">#{rank}</span>
                        ) : rank === 3 ? (
                          <span className="text-[#51c1a9]">#{rank}</span>
                        ) : (
                          <span className="text-gray-600">#{rank}</span>
                        )}
                      </div>
                      <div className={`
                        relative w-8 h-8 rounded-full overflow-hidden
                        ${rankColor}
                      `}>
                        <Image
                          src={user.profile_picture_url}
                          alt={user.user_name}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className={`
                        flex-1 text-sm font-medium flex items-center gap-2
                        ${rank <= 3
                          ? 'text-gray-800'
                          : 'text-gray-600'
                        }
                      `}>
                        {user.user_name}
                        {isAgent45 && (
                          <div className="relative w-6 h-6">
                            <Image
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-QHfb4ipTQUu1iR54Vmxo6g-RFBtanJsS0aS2a2tOFHHXg-removebg-preview-uO3TxQD0G4UantJb2x6eXvjB5OUvjn.png"
                              alt="Calendar Icon"
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          </div>
                        )}
                      </div>
                      <div className={`
                        text-sm font-medium
                        ${rank <= 3
                          ? 'text-gray-800'
                          : 'text-gray-600'
                        }
                      `}>
                        {user.total_points.toLocaleString()} pts
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
