import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Helper functions for streak calculations
const calculateStreak = (dates: Date[]): number => {
  if (dates.length === 0) return 0;
  
  const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentStreak = 0;
  let prevDate = today;
  
  for (const date of sortedDates) {
    const diff = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      currentStreak++;
      prevDate = date;
    } else if (diff === 0) {
      // Same day, continue
      prevDate = date;
    } else {
      break;
    }
  }
  
  return currentStreak + (sortedDates[0]?.toDateString() === today.toDateString() ? 1 : 0);
};

const calculateLongestStreak = (dates: Date[]): number => {
  if (dates.length === 0) return 0;
  
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
  let currentStreak = 1;
  let maxStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = Math.floor((sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diff !== 0) {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

const calculateMonthlyConsistency = (dates: Date[]): string => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysPassed = Math.min(today.getDate(), daysInMonth);
  
  const daysTrackedThisMonth = dates.filter(date => 
    date.getMonth() === currentMonth && 
    date.getFullYear() === currentYear
  ).length;
  
  return `${Math.round((daysTrackedThisMonth / daysPassed) * 100)}%`;
};

// POST endpoint
export async function POST(request: Request) {
  try {
    const { memberId } = await request.json();
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Add today's practice record
    const today = new Date();
    await pool.sql`
      INSERT INTO practice_streaks (member_id, practice_date)
      VALUES (${memberId}, ${today})
      ON CONFLICT (member_id, practice_date) DO NOTHING;
    `;

    // Get all practice dates for this member
    const { rows } = await pool.sql`
      SELECT practice_date
      FROM practice_streaks
      WHERE member_id = ${memberId}
      ORDER BY practice_date DESC;
    `;

    const practiceDates = rows.map(row => new Date(row.practice_date));
    
    const streakData = {
      current: calculateStreak(practiceDates),
      consistency: calculateMonthlyConsistency(practiceDates),
      longest: calculateLongestStreak(practiceDates),
      dates: practiceDates
    };

    return NextResponse.json(streakData);
  } catch (error) {
    console.error('Error updating practice streak:', error);
    return NextResponse.json({ error: 'Failed to update practice streak' }, { status: 500 });
  }
}

// GET endpoint
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const { rows } = await pool.sql`
      SELECT practice_date
      FROM practice_streaks
      WHERE member_id = ${memberId}
      ORDER BY practice_date DESC;
    `;

    const practiceDates = rows.map(row => new Date(row.practice_date));
    
    const streakData = {
      current: calculateStreak(practiceDates),
      consistency: calculateMonthlyConsistency(practiceDates),
      longest: calculateLongestStreak(practiceDates),
      dates: practiceDates
    };

    return NextResponse.json(streakData);
  } catch (error) {
    console.error('Error getting practice streaks:', error);
    return NextResponse.json({ error: 'Failed to get practice streaks' }, { status: 500 });
  }
}
