import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartDataPoint {
  day: string;
  date: string;
  you: number;
}

interface LeagueChartProps {
  chartData: ChartDataPoint[];
  weeklyRankings: Array<{
    member_id: string;
    points: number;
  }>;
}

export function LeagueChart({ chartData, weeklyRankings }: LeagueChartProps) {
  const today = new Date();
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Filter data up to current day
  const data = chartData.filter(point => {
    const pointDate = new Date(point.date);
    return pointDate <= today;
  });

  // Find top player (excluding yourself)
  const topPlayer = weeklyRankings.length > 1 ? weeklyRankings[0] : null;
  const shouldShowTopPlayer = topPlayer && topPlayer.points > (data[data.length - 1]?.you || 0);
  
  // Add this function inside your LeagueChart component, before the return:
const findPointsForDate = (date: string, points: number) => {
  const pointDate = new Date(date).toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];
  return pointDate === todayStr ? points : 0;
};

// And then replace the old dataWithTopPlayer with:
const findCumulativePoints = (currentDate: string, allData: ChartDataPoint[], topPlayerTotal: number) => {
  const currentPointDate = new Date(currentDate);
  let runningTotal = 0;
  
  // Go through all dates up to the current point's date
  allData.forEach(point => {
    const pointDate = new Date(point.date);
    if (pointDate <= currentPointDate) {
      if (pointDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]) {
        runningTotal = topPlayerTotal;
      }
    }
  });
  
  return runningTotal;
};

const dataWithTopPlayer = shouldShowTopPlayer ? data.map(point => ({
  ...point,
  topPlayer: findCumulativePoints(point.date, data, topPlayer.points)
})) : data;

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-h-[200px] w-full min-w-[300px]">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart 
            data={dataWithTopPlayer}
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
              domain={[0, Math.max(topPlayer?.points || 0, data[data.length - 1]?.you || 0)]}
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
              formatter={(value: number) => [`${value.toLocaleString()} points`]}
            />
            <Line 
              type="monotone" 
              dataKey="you" 
              name="You"
              stroke="#5b06be" 
              strokeWidth={2}
              dot={false}
            />
            {shouldShowTopPlayer && (
              <Line 
                type="monotone" 
                dataKey="topPlayer" 
                name="Top Player"
                stroke="#f8b922" 
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
