import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartDataPoint {
  day: string;
  date: string;
  you: number;
}

interface LeagueChartProps {
  chartData: ChartDataPoint[];
  topPlayerScore: number;
}

export function LeagueChart({ chartData, topPlayerScore }: LeagueChartProps) {
  const today = new Date();
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Calculate cumulative totals
  let runningTotal = 0;
  const data = chartData
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(point => {
      runningTotal += point.you;
      return {
        ...point,
        you: runningTotal,
        // For top player, we'll show linear progression towards their total
        topPlayer: Math.round(topPlayerScore * (new Date(point.date).getDay() / 6))
      };
    });

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-h-[200px] w-full min-w-[300px]">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart 
            data={data}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
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
              tick={{ fill: '#DAF0F2', fontSize: '0.625rem' }}
              dy={5}
              interval={0}
              ticks={days.slice(0, currentDayIndex + 1)}
              angle={-20}
              textAnchor="end"
              height={40}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#DAF0F2', fontSize: '0.625rem' }}
              domain={[0, Math.max(topPlayerScore, data[data.length - 1]?.you || 0)]}
              allowDecimals={false}
              width={25}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '0.625rem',
                boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)',
                padding: '0.5rem'
              }}
              itemStyle={{ color: '#000000', fontSize: '0.625rem' }}
              labelStyle={{ color: '#000000', fontWeight: 600, marginBottom: '0.125rem', fontSize: '0.625rem' }}
            />
            <Line 
              type="monotone" 
              dataKey="you" 
              name="You"
              stroke="#5b06be" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="topPlayer" 
              name="Top Player"
              stroke="#f8b922" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
