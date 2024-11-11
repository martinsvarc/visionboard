// page.tsx
'use client'

import * as React from "react"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useSearchParams } from 'next/navigation'
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
import { ErrorBoundary } from "react-error-boundary"

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

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen w-full bg-white p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-[#f2f3f9] rounded-[32px] p-6 shadow-lg">
        <Card className="bg-white border-0 shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="text-red-500">Something went wrong</div>
            <Button onClick={resetErrorBoundary}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
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

function LeaderboardContent() {
  const [category, setCategory] = React.useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [leagueData, setLeagueData] = React.useState<LeagueData[]>([])
  const [chartData, setChartData] = React.useState<{ date: string; points: number }[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const searchParams = useSearchParams()
  const memberId = searchParams.get('memberId')

  const fetchLeaderboardData = React.useCallback(async () => {
    if (!memberId) {
      console.log("No memberId found");
      setIsLoading(false);
      return;
    }

    setIsLoading(true)
    setError(null)
    try {
      console.log("Fetching data for memberId:", memberId);
      const response = await fetch(`/api/league?period=${category}&memberId=${memberId}`)
      if (!response.ok) throw new Error('Failed to fetch leaderboard data')
      const data = await response.json()
      console.log("Received data:", data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      setLeagueData(data.leaderboard)
      setChartData(data.chartData)
    } catch (err) {
      console.error('Error fetching leaderboard data:', err)
      setError('Failed to fetch leaderboard data')
    }
    setIsLoading(false)
  }, [category, memberId])

  React.useEffect(() => {
    if (memberId) {
      console.log("Initiating fetch for memberId:", memberId);
      fetchLeaderboardData()
    } else {
      console.log("No memberId available");
      setIsLoading(false);
    }
  }, [fetchLeaderboardData, memberId])

  const getCurrentUserPoints = () => {
    console.log("Getting points for memberId:", memberId);
    console.log("Current leagueData:", leagueData);
    
    if (!leagueData?.length || !memberId) return 0;
    const currentUser = leagueData.find(user => user.user_name === memberId);
    console.log("Found user:", currentUser);
    return currentUser ? currentUser.total_points : 0;
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-white p-4 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-white p-4 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-[#f2f3f9] rounded-[32px] p-6 shadow-lg">
          <Card className="bg-white border-0 shadow-none">
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="text-red-500">{error}</div>
              <Button onClick={fetchLeaderboardData}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
                Your Score in {categoryNames[category]}
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

            <div className="space-y-2">
              {leagueData?.map((user, index) => {
                const rank = user.rank;
                const rankColor = getRankColor(rank);
                const isAgent45 = user.user_name.toLowerCase() === 'agent45';
                const isCurrentUser = user.user_name === memberId;
                
                return (
                  <div 
                    key={index}
                    className={`
                      flex items-center gap-3 p-3 rounded-[16px] 
                      ${rank <= 3 ? 'bg-gray-100' : 'bg-white hover:bg-gray-100'}
                      ${isCurrentUser ? 'border-2 border-[#556bc7] bg-blue-50' : ''}
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
                        src={user.profile_picture_url || "/placeholder.svg?height=32&width=32"}
                        alt={user.user_name}
                        width={32}
                        height={32}
                        className="object-contain"
                        loading="eager"
                        unoptimized
                        onError={(e) => {
                          console.error('Failed to load image:', user.profile_picture_url);
                          e.currentTarget.src = '/placeholder.svg?height=32&width=32';
                        }}
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      }>
        <LeaderboardContent />
      </Suspense>
    </ErrorBoundary>
  );
}

// route.ts
import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    console.log('Processing request for:', { memberId, period }); // Debug log

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    let query;
    if (period === 'daily') {
      query = await pool.sql`
        WITH UserScores AS (
          SELECT 
            user_name,
            SUM(overall_effectiveness_score) as total_points,
            COUNT(*) as call_count,
            MAX(call_date) as last_call_date,
            ARRAY_AGG(overall_effectiveness_score ORDER BY call_date) as score_history,
            MAX(user_picture_url) as profile_picture_url
          FROM call_logs
          WHERE user_name IS NOT NULL
            AND call_date >= CURRENT_DATE
          GROUP BY user_name
        ),
        RankedScores AS (
          SELECT 
            user_name,
            total_points,
            call_count,
            last_call_date,
            score_history,
            profile_picture_url,
            RANK() OVER (ORDER BY total_points DESC) as rank
          FROM UserScores
        )
        SELECT * FROM RankedScores
        WHERE user_name = ${memberId}
           OR rank <= 10
        ORDER BY rank ASC;
      `;
    } else if (period === 'weekly') {
      query = await pool.sql`
        WITH UserScores AS (
          SELECT 
            user_name,
            SUM(overall_effectiveness_score) as total_points,
            COUNT(*) as call_count,
            MAX(call_date) as last_call_date,
            ARRAY_AGG(overall_effectiveness_score ORDER BY call_date) as score_history,
            MAX(user_picture_url) as profile_picture_url
          FROM call_logs
          WHERE user_name IS NOT NULL
            AND call_date >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY user_name
        ),
        RankedScores AS (
          SELECT 
            user_name,
            total_points,
            call_count,
            last_call_date,
            score_history,
            profile_picture_url,
            RANK() OVER (ORDER BY total_points DESC) as rank
          FROM UserScores
        )
        SELECT * FROM RankedScores
        WHERE user_name = ${memberId}
           OR rank <= 10
        ORDER BY rank ASC;
      `;
    } else {
      // monthly
      query = await pool.sql`
        WITH UserScores AS (
          SELECT 
            user_name,
            SUM(overall_effectiveness_score) as total_points,
            COUNT(*) as call_count,
            MAX(call_date) as last_call_date,
            ARRAY_AGG(overall_effectiveness_score ORDER BY call_date) as score_history,
            MAX(user_picture_url) as profile_picture_url
          FROM call_logs
          WHERE user_name IS NOT NULL
            AND call_date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY user_name
        ),
        RankedScores AS (
          SELECT 
            user_name,
            total_points,
            call_count,
            last_call_date,
            score_history,
            profile_picture_url,
            RANK() OVER (ORDER BY total_points DESC) as rank
          FROM UserScores
        )
        SELECT * FROM RankedScores
        WHERE user_name = ${memberId}
           OR rank <= 10
        ORDER BY rank ASC;
      `;
    }

    const { rows } = query;

    // Get chart data specifically for the member
    let chartQuery;
    if (period === 'daily') {
      chartQuery = await pool.sql`
        WITH DailyScores AS (
          SELECT 
            DATE_TRUNC('hour', call_date) as date,
            SUM(overall_effectiveness_score) as daily_total
          FROM call_logs
          WHERE user_name = ${memberId}
            AND call_date >= CURRENT_DATE
          GROUP BY DATE_TRUNC('hour', call_date)
          ORDER BY date ASC
        )
        SELECT 
          TO_CHAR(date, 'YYYY-MM-DD HH24:MI') as date,
          COALESCE(daily_total, 0) as points
        FROM DailyScores;
      `;
    } else if (period === 'weekly') {
      chartQuery = await pool.sql`
        WITH DailyScores AS (
          SELECT 
            DATE_TRUNC('day', call_date) as date,
            SUM(overall_effectiveness_score) as daily_total
          FROM call_logs
          WHERE user_name = ${memberId}
            AND call_date >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE_TRUNC('day', call_date)
          ORDER BY date ASC
        )
        SELECT 
          TO_CHAR(date, 'YYYY-MM-DD') as date,
          COALESCE(daily_total, 0) as points
        FROM DailyScores;
      `;
    } else {
      chartQuery = await pool.sql`
        WITH DailyScores AS (
          SELECT 
            DATE_TRUNC('day', call_date) as date,
            SUM(overall_effectiveness_score) as daily_total
          FROM call_logs
          WHERE user_name = ${memberId}
            AND call_date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE_TRUNC('day', call_date)
          ORDER BY date ASC
        )
        SELECT 
          TO_CHAR(date, 'YYYY-MM-DD') as date,
          COALESCE(daily_total, 0) as points
        FROM DailyScores;
      `;
    }

    console.log('Query results:', { rows, chartData: chartQuery.rows }); // Debug log

    return NextResponse.json({
      leaderboard: rows.map(row => ({
        user_name: row.user_name,
        total_points: Math.round(parseFloat(row.total_points)),
        call_count: parseInt(row.call_count),
        last_call_date: row.last_call_date,
        score_history: row.score_history.map((score: string) => parseFloat(score)),
        rank: parseInt(row.rank),
        profile_picture_url: row.profile_picture_url || '/placeholder.svg?height=32&width=32'
      })),
      chartData: chartQuery.rows.map(row => ({
        date: row.date,
        points: Math.round(parseFloat(row.points))
      }))
    });
  } catch (error) {
    console.error('Error getting league data:', error);
    return NextResponse.json({ error: 'Failed to get league data' }, { status: 500 });
  }
}
