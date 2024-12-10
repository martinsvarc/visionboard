import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartDataPoint {
  day: string;
  date: string;
  you: number;
  topPlayer?: number;
}

interface LeagueChartProps {
  chartData: ChartDataPoint[];
  topPlayerScore: number;
}

export function LeagueChart({ chartData, topPlayerScore }: LeagueChartProps) {
  const today = new Date();
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Calculate daily progression for top player
  const data = chartData.map((point, index) => {
    // Calculate what percentage of the week has passed
    const daysPassed = index + 1;
    const weekProgress = daysPassed / 7;
    
    // Top player's projected score for this day
    const topPlayerPoint = Math.round(topPlayerScore * weekProgress);

    return {
      ...point,
      topPlayer: topPlayerPoint
    };
  });

  // Calculate max score for Y-axis
  const maxYourScore = Math.max(...data.map(point => point.you));
  const maxScore = Math.max(topPlayerScore, maxYourScore);
  
  // Ensure we show only the days up to today
  const visibleDays = days.slice(0, currentDayIndex + 1);
  const visibleData = data.filter((_, index) => index <= currentDayIndex);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-h-[200px] w-full min-w-[300px]">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart 
            data={visibleData}
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
              ticks={visibleDays}
              angle={-20}
              textAnchor="end"
              height={40}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#DAF0F2', fontSize: '0.625rem' }}
              domain={[0, maxScore]}
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
              formatter={(value: number) => [`${value.toLocaleString()} points`, undefined]}
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
