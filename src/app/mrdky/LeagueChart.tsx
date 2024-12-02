import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DayData {
  day: string
  you: number
  topPlayer: number
}

interface LeagueChartProps {
  data: DayData[]
}

export function LeagueChart({ data }: LeagueChartProps) {
  const maxScore = Math.max(
    ...data.map(day => Math.max(day.you, day.topPlayer))
  )
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="bg-white rounded-[15px] p-3">
      <ResponsiveContainer width="100%" height={250} minWidth={400}>
        <LineChart 
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#E5E7EB" 
            vertical={false}
          />
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#556bc7', fontSize: 10 }}
            dy={10}
            interval={0}
            ticks={days}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#556bc7', fontSize: 10 }}
            domain={[0, maxScore]}
            allowDecimals={false}
            width={30}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '10px',
              boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)',
              padding: '8px'
            }}
            itemStyle={{ color: '#556bc7', fontSize: 10 }}
            labelStyle={{ color: '#556bc7', fontWeight: 600, marginBottom: '2px', fontSize: 10 }}
          />
          <Line 
            type="monotone" 
            dataKey="you" 
            name="You"
            stroke="#51c1a9" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="topPlayer" 
            name="Top Player"
            stroke="#fbb350" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
