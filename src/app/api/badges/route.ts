import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get('memberId')

  // Dummy data to match your BadgeData interface
  const dummyData = {
    memberId: memberId || 'default',
    practice_streak: 15,
    total_calls: 75,
    daily_calls: 8,
    weekly_calls: 35,
    monthly_calls: 85,
    current_week_points: 450,
    league_rank: 'Silver',
    unlocked_badges: {
      practice_streak: [5, 10],  // Has unlocked 5 and 10 day streaks
      completed_calls: [10, 25, 50],  // Has completed 10, 25, and 50 calls
      activity_goals: ['daily_10', 'weekly_50']  // Has achieved daily and weekly goals
    }
  }

  return NextResponse.json(dummyData)
}
