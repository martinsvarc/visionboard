'use client';

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useSearchParams } from 'next/navigation'

export default function LeaderboardComponent() {
  const [category, setCategory] = React.useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [leaderboardData, setLeaderboardData] = React.useState<any[]>([])
  const [chartData, setChartData] = React.useState<any[]>([])
  const [userStats, setUserStats] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const searchParams = useSearchParams()
  const memberId = searchParams.get('memberId')

  const categoryNames = {
    daily: "Weekly League",
    weekly: "All Time",
    monthly: "All Time Team",
  }

  // Keep your existing fetch function
  const fetchLeaderboardData = async () => {
    if (!memberId) return
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        memberId: memberId,
        category: category
      }).toString()
      const response = await fetch(`/api/league?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setLeaderboardData(data.leaderboard || [])
      setChartData(data.chartData || [])
      setUserStats(data.userStats || null)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchLeaderboardData()
  }, [category, memberId])

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'ring-[#fbb350] shadow-[0_0_15px_rgba(255,179,82,0.3)]'
      case 2: return 'ring-[#556bc7] shadow-[0_0_15px_rgba(85,107,199,0.3)]'
      case 3: return 'ring-[#51c1a9] shadow-[0_0_15px_rgba(81,193,169,0.3)]'
      default: return 'ring-white/50'
    }
  }

  const renderUserProfile = (user: any, index: number) => {
    const rank = index + 1
    const rankColor = getRankColor(rank)
    const isCurrentUser = user.user_id === userStats?.user_id

    return (
      <div
        key={user.user_id}
        className={`
          flex items-center gap-3 p-3 rounded-[20px] bg-white
          ${isCurrentUser ? 'border-2 border-[#51c1a9]' :
            rank === 1 ? 'border-2 border-[#fbb350]' : 
            rank === 2 ? 'border-2 border-gray-300' : 
            rank === 3 ? 'border-2 border-[#cd7f32]' : 
            'border border-gray-200'}
          transition-all duration-300 hover:bg-gray-50
        `}
      >
        <div className="flex-none w-12 text-sm font-medium">
          <span className={`${
            isCurrentUser ? 'text-[#51c1a9]' :
            rank === 1 ? 'text-[#fbb350]' : 
            rank === 2 ? 'text-gray-600' : 
            rank === 3 ? 'text-[#cd7f32]' : 
            'text-gray-400'
          }`}>#{rank}</span>
        </div>
        <div className={`relative w-12 h-12 rounded-full overflow-hidden ${rankColor}`}>
          <Image
            src={user.profile_image_url || "/placeholder.jpg"}
            alt={user.user_name}
            width={48}
            height={48}
            className="object-cover"
            unoptimized
          />
        </div>
        <div className={`
          flex-1 text-sm font-medium flex items-center gap-2
          ${rank <= 3 ? 'text-gray-800' : 'text-gray-600'}
        `}>
          {user.user_name}
          {rank === 1 && (
            <div className="relative w-8 h-8 ml-2">
              <Image
                src="/badges/first.png"
                alt="First Place Badge"
                width={32}
                height={32}
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </div>
        <div className={`
          text-sm font-medium
          ${isCurrentUser ? 'text-[#51c1a9]' :
            rank === 1 ? 'text-[#fbb350]' : 
            rank === 2 ? 'text-gray-600' : 
            rank === 3 ? 'text-[#cd7f32]' : 
            'text-gray-600'}
        `}>
          {user.score.toLocaleString()} pts
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 p-4 flex items-center justify-center">
      <div className="w-full">
        <Card className="border shadow-lg font-['Montserrat'] bg-white">
          <CardContent className="pt-6">
            <div className="bg-white rounded-[20px] p-6 shadow-md">
              <div className="flex flex-col gap-6 mb-8">
                <h2 className="text-[25px] font-bold leading-[1.3] text-[#556bc7]">League</h2>
                <Tabs value={category} onValueChange={(value) => setCategory(value as 'daily' | 'weekly' | 'monthly')} className="w-full">
                  <TabsList className="w-full flex justify-between bg-gray-50/50 p-1 rounded-full">
                    {Object.entries(categoryNames).map(([value, label]) => (
                      <TabsTrigger 
                        key={value}
                        value={value}
                        className="flex-1 relative z-10 rounded-full px-8 py-3 text-base font-medium text-gray-600 transition-all duration-300 hover:text-gray-900 data-[state=active]:bg-[#fbb350] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_16px_-4px_rgba(251,179,80,0.3),0_4px_6px_-2px_rgba(251,179,80,0.2)]"
                      >
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="h-[160px] sm:h-[180px] md:h-[200px] w-full bg-gray-100 rounded-[20px] p-3 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#51c1a9" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#51c1a9" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbb350" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#fbb350" stopOpacity={0.1} />
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
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-[12px] border border-gray-200 bg-white p-3 shadow-lg">
                              <p className="text-sm font-medium" style={{ color: '#fbb350' }}>
                                Top Score: {payload[1]?.value?.toLocaleString()} points
                              </p>
                              <p className="text-sm font-medium" style={{ color: '#51c1a9' }}>
                                Your Score: {payload[0]?.value?.toLocaleString()} points
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="user_points"
                      stroke="#51c1a9"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPoints)"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="top_user_points"
                      stroke="#fbb350"
                      strokeWidth={2}
                      fillOpacity={0.3}
                      fill="url(#goldGradient)"
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
                <div className="space-y-4">
                  {userStats && renderUserProfile({
                    user_id: userStats.user_id,
                    user_name: userStats.user_name,
                    profile_image_url: userStats.profile_image_url,
                    score: userStats[category === 'daily' ? 'daily_score' : 
                            category === 'weekly' ? 'weekly_score' : 
                            'all_time_score']
                  }, userStats.rank - 1)}
                  <h3 className="text-xl font-bold text-[#556bc7]">Top 3 places</h3>
                  <div className="space-y-2">
                    {leaderboardData.slice(0, 3).map((user, index) => renderUserProfile(user, index))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
