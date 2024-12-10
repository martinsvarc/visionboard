import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { ACHIEVEMENTS } from '@/lib/achievement-data';

const getNextSunday = (date: Date = new Date()) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  const dayOfWeek = newDate.getDay();
  const daysUntilNextSunday = 7 - dayOfWeek;
  newDate.setDate(newDate.getDate() + daysUntilNextSunday);
  return newDate;
};

function getDayKey(date: Date) {
  return date.toISOString().split('T')[0];
}

function isNewMonth(lastDate: Date, currentDate: Date = new Date()) {
  return lastDate.getMonth() !== currentDate.getMonth() || 
         lastDate.getFullYear() !== currentDate.getFullYear();
}

// Helper to calculate total points from daily_points within the current week
function calculateWeeklyTotal(daily_points: Record<string, number>, weekly_reset_at: string) {
  const resetDate = new Date(weekly_reset_at);
  const nextSunday = getNextSunday(resetDate);
  
  return Object.entries(daily_points || {}).reduce((total, [date, points]) => {
    const pointDate = new Date(date);
    if (pointDate >= resetDate && pointDate < nextSunday) {
      return total + points;
    }
    return total;
  }, 0);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, userName, userPicture, teamId, points } = body;
    
    if (!memberId || !userName) {
      return NextResponse.json({ error: 'Member ID and username required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    const todayKey = getDayKey(today);

    const { rows: [existingUser] } = await pool.sql`
      SELECT * FROM user_achievements 
      WHERE member_id = ${memberId};
    `;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Calculate streaks and sessions
    const current_streak = existingUser?.last_session_date === todayStr ? 
      (existingUser.current_streak || 1) : 
      (existingUser?.last_session_date === yesterdayStr ? (existingUser.current_streak || 0) + 1 : 1);
    
    const longest_streak = Math.max(current_streak, existingUser?.longest_streak || 0);
    const total_sessions = (existingUser?.total_sessions || 0) + 1;

    // Update daily points
    const current_daily_points = {
      ...existingUser?.daily_points,
      [todayKey]: parseFloat((existingUser?.daily_points || {})[todayKey] || 0) + parseFloat(points)
    };

    // Session counts
    const shouldResetMonth = !existingUser?.last_session_date ? 
      true : 
      isNewMonth(new Date(existingUser.last_session_date));

    const lastSessionDate = existingUser?.last_session_date ? new Date(existingUser.last_session_date) : null;
    if (lastSessionDate) {
      lastSessionDate.setHours(0, 0, 0, 0);
    }

    const sessions_today = lastSessionDate && lastSessionDate.getTime() === today.getTime() ? 
      (existingUser?.sessions_today || 0) + 1 : 1;

    const sessions_this_week = (existingUser?.sessions_this_week || 0) + 1;

    const sessions_this_month = shouldResetMonth ? 
      1 : 
      (existingUser?.sessions_this_month || 0) + 1;

    // Badge handling
    let unlocked_badges = Array.isArray(existingUser?.unlocked_badges) 
      ? [...existingUser.unlocked_badges] 
      : [];

    // Keep existing badge logic
    if (current_streak >= 5) unlocked_badges = addBadge(unlocked_badges, 'streak_5');
    if (current_streak >= 10) unlocked_badges = addBadge(unlocked_badges, 'streak_10');
    if (current_streak >= 30) unlocked_badges = addBadge(unlocked_badges, 'streak_30');
    if (current_streak >= 90) unlocked_badges = addBadge(unlocked_badges, 'streak_90');
    if (current_streak >= 180) unlocked_badges = addBadge(unlocked_badges, 'streak_180');
    if (current_streak >= 365) unlocked_badges = addBadge(unlocked_badges, 'streak_365');

    if (total_sessions >= 10) unlocked_badges = addBadge(unlocked_badges, 'calls_10');
    if (total_sessions >= 25) unlocked_badges = addBadge(unlocked_badges, 'calls_25');
    if (total_sessions >= 50) unlocked_badges = addBadge(unlocked_badges, 'calls_50');
    if (total_sessions >= 100) unlocked_badges = addBadge(unlocked_badges, 'calls_100');

    if (sessions_today >= 10) unlocked_badges = addBadge(unlocked_badges, 'daily_10');
    if (sessions_this_week >= 50) unlocked_badges = addBadge(unlocked_badges, 'weekly_50');
    if (sessions_this_month >= 100) unlocked_badges = addBadge(unlocked_badges, 'monthly_100');

    const weekly_reset_at = existingUser?.weekly_reset_at || getNextSunday().toISOString();

    const { rows: [updated] } = await pool.sql`
      INSERT INTO user_achievements (
        member_id, 
        user_name, 
        user_picture, 
        team_id,
        current_streak,
        longest_streak,
        total_sessions,
        sessions_today,
        sessions_this_week,
        sessions_this_month,
        last_session_date,
        unlocked_badges,
        weekly_reset_at,
        daily_points
      ) VALUES (
        ${memberId},
        ${userName},
        ${userPicture},
        ${teamId},
        1,
        1,
        1,
        ${sessions_today},
        ${sessions_this_week},
        ${sessions_this_month},
        ${todayStr},
        ${JSON.stringify(unlocked_badges)},
        ${weekly_reset_at},
        ${JSON.stringify(current_daily_points)}
      )
      ON CONFLICT (member_id) DO UPDATE SET
        user_name = EXCLUDED.user_name,
        user_picture = ${userPicture || 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732590120/WhatsApp_Image_2024-11-26_at_04.00.13_58e32347_owfpnt.jpg'},
        team_id = EXCLUDED.team_id,
        total_sessions = user_achievements.total_sessions + 1,
        sessions_today = ${sessions_today},
        sessions_this_week = user_achievements.sessions_this_week + 1,
        sessions_this_month = CASE 
          WHEN TO_CHAR(user_achievements.last_session_date::date, 'YYYY-MM') != TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN 1
          ELSE user_achievements.sessions_this_month + 1
        END,
        current_streak = ${current_streak},
        longest_streak = ${longest_streak},
        last_session_date = ${today.toISOString()},
        unlocked_badges = ${JSON.stringify(unlocked_badges)},
        weekly_reset_at = ${weekly_reset_at},
        daily_points = ${JSON.stringify(current_daily_points)},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    // Calculate current rankings based on weekly totals
    const { rows: currentRankings } = await pool.sql`
      WITH weekly_totals AS (
        SELECT 
          member_id,
          (SELECT SUM(value::numeric)
           FROM jsonb_each_text(daily_points)
           WHERE key::date >= weekly_reset_at::date
             AND key::date < ${getNextSunday(new Date(weekly_reset_at)).toISOString()}::date
          ) as total_points
        FROM user_achievements
        WHERE weekly_reset_at = ${weekly_reset_at}
      )
      SELECT 
        member_id,
        DENSE_RANK() OVER (ORDER BY total_points DESC) as rank
      FROM weekly_totals
      WHERE total_points > 0
      ORDER BY total_points DESC;
    `;

    const userRank = currentRankings.find(r => r.member_id === memberId)?.rank;

    return NextResponse.json({
      ...updated,
      weeklyTotal: calculateWeeklyTotal(current_daily_points, weekly_reset_at),
      rank: userRank
    });

  } catch (error) {
    console.error('Error updating achievements:', error);
    return NextResponse.json({ error: 'Failed to update achievements' }, { status: 500 });
  }
}

// Continue GET method from the same file

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

    const { rows: [userData] } = await pool.sql`
      SELECT * FROM user_achievements WHERE member_id = ${memberId};
    `;

    // Transform daily points for the chart - only show current week's data
    const dailyPointsData = userData?.daily_points || {};
    const weekStart = new Date(userData?.weekly_reset_at);
    const weekEnd = getNextSunday(weekStart);

    let runningTotal = 0;
    const chartData = Object.entries(dailyPointsData)
      .filter(([date]) => {
        const pointDate = new Date(date);
        return pointDate >= weekStart && pointDate < weekEnd;
      })
      .map(([date, points]) => {
        runningTotal += Number(points);
        return {
          day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
          date,
          you: runningTotal
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const achievementsData = {
      streakAchievements: ACHIEVEMENTS.streak.map(badge => ({
        ...badge,
        unlocked: userData?.unlocked_badges?.includes(`streak_${badge.target}`) || false
      })),
      
      callAchievements: ACHIEVEMENTS.calls.map(badge => ({
        ...badge,
        unlocked: userData?.unlocked_badges?.includes(`calls_${badge.target}`) || false
      })),
      
      activityAchievements: ACHIEVEMENTS.activity.map(badge => {
        const isUnlocked = userData?.unlocked_badges?.includes(badge.id);
        return {
          ...badge,
          unlocked: isUnlocked || false
        };
      }),
      
      leagueAchievements: ACHIEVEMENTS.league.map(badge => {
        const leagueBadge = badge as { 
          id: string; 
          image: string; 
          description: string; 
          tooltipTitle: string; 
          tooltipSubtitle: string; 
          target: number;
          rank?: string;
        };
        return {
          ...leagueBadge,
          unlocked: userData?.unlocked_badges?.includes(badge.id) || false
        };
      })
    };

    // Get weekly rankings based on sum of daily points
    const { rows: weeklyRankings } = await pool.sql`
      WITH weekly_totals AS (
        SELECT 
          ua.member_id, 
          ua.user_name, 
          ua.user_picture, 
          ua.unlocked_badges,
          (SELECT SUM(value::numeric)
           FROM jsonb_each_text(ua.daily_points)
           WHERE key::date >= ua.weekly_reset_at::date
             AND key::date < ${getNextSunday(new Date(userData?.weekly_reset_at)).toISOString()}::date
          ) as points
        FROM user_achievements ua
        WHERE ua.weekly_reset_at = ${userData?.weekly_reset_at}
      )
      SELECT 
        member_id, 
        user_name, 
        user_picture, 
        points, 
        unlocked_badges,
        RANK() OVER (ORDER BY points DESC NULLS LAST) as rank
      FROM weekly_totals
      WHERE points > 0
      ORDER BY points DESC 
      LIMIT 10;
    `;

    // Get team rankings based on sum of daily points
    const { rows: teamRankings } = await pool.sql`
      WITH team_totals AS (
        SELECT 
          ua.member_id, 
          ua.user_name, 
          ua.user_picture, 
          ua.unlocked_badges,
          (SELECT SUM(value::numeric)
           FROM jsonb_each_text(ua.daily_points)
           WHERE key::date >= ua.weekly_reset_at::date
             AND key::date < ${getNextSunday(new Date(userData?.weekly_reset_at)).toISOString()}::date
          ) as points
        FROM user_achievements ua
        WHERE ua.team_id = ${userData?.team_id}
        AND ua.weekly_reset_at = ${userData?.weekly_reset_at}
      )
      SELECT 
        member_id, 
        user_name, 
        user_picture, 
        points, 
        unlocked_badges,
        RANK() OVER (ORDER BY points DESC NULLS LAST) as rank
      FROM team_totals
      WHERE points > 0
      ORDER BY points DESC 
      LIMIT 10;
    `;

    return NextResponse.json({
      ...achievementsData,
      userData: {
        ...userData,
        weeklyTotal: calculateWeeklyTotal(userData?.daily_points, userData?.weekly_reset_at)
      },
      weeklyRankings,
      teamRankings,
      chartData
    });

  } catch (error) {
    console.error('Error getting achievements:', error);
    return NextResponse.json({ error: 'Failed to get achievements' }, { status: 500 });
  }
}

function addBadge(badges: string[], newBadge: string): string[] {
  return badges.includes(newBadge) ? badges : [...badges, newBadge];
}

export type { ChartDataPoint };
interface ChartDataPoint {
  day: string;
  date: string;
  you: number;
}
