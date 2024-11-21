import React from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ChartDataPoint {
  date: string
  userPoints: number
  topUserPoints: number
}

interface LeagueChartProps {
  currentUserScore: number
  topPlayerScore: number
  historicalData?: ChartDataPoint[]
}

export function LeagueChart({ currentUserScore, topPlayerScore, historicalData }: LeagueChartProps) {
  const chartData = historicalData || generateChartData(currentUserScore, topPlayerScore)

  return (
    <div className="relative h-48 bg-gradient-to-t from-[#51c1a9]/20 via-[#51c1a9]/10 to-transparent rounded-[20px] overflow-hidden px-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUserPoints" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#51c1a9" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#51c1a9" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorTopUserPoints" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbb350" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fbb350" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="date" 
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={{ fill: '#888888' }}
            padding={{ left: 10, right: 10 }}
          />
          
          <YAxis 
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            width={30}
          />
          
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-md">
                    <p className="text-sm font-medium" style={{ color: '#51c1a9' }}>
                      Your Score: {payload[0].value}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#fbb350' }}>
                      Top Score: {payload[1].value}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Area
            type="monotone"
            dataKey="userPoints"
            stroke="#51c1a9"
            strokeWidth={2}
            fill="url(#colorUserPoints)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="topUserPoints"
            stroke="#fbb350"
            strokeWidth={2}
            fill="url(#colorTopUserPoints)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function generateChartData(userScore: number, topScore: number): ChartDataPoint[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    
    const progressPercentage = i / 6;
    const userPoints = Math.round(userScore * (0.7 + (0.3 * progressPercentage)));
    const topUserPoints = Math.round(topScore * (0.7 + (0.3 * progressPercentage)));
    
    return {
      date: day.toLocaleDateString('en-US', { weekday: 'short' }),
      userPoints: userPoints,
      topUserPoints: topUserPoints,
    };
  });
}
