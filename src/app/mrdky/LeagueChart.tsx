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

  const data = chartData.map((point, index) => {
    const topPlayerPoint = (point.you / chartData[chartData.length - 1].you) * topPlayerScore;
    return {
      ...point,
      topPlayer: Math.round(topPlayerPoint)
    };
  });

  const maxScore = Math.max(topPlayerScore, data[data.length - 1]?.you || 0);

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
              tick={{ fill: '#556bc7', fontSize: '0.625rem' }}
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
              tick={{ fill: '#556bc7', fontSize: '0.625rem' }}
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
              itemStyle={{ color: '#556bc7', fontSize: '0.625rem' }}
              labelStyle={{ color: '#556bc7', fontWeight: 600, marginBottom: '0.125rem', fontSize: '0.625rem' }}
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
    </div>
  );
}
