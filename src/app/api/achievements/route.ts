import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { ACHIEVEMENTS } from '@/lib/achievement-data';

const getNextSunday = (date: Date = new Date()) => {
  // Create date in local time
  const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Get days until next Sunday (0 = Sunday, 1 = Monday, etc)
  const dayOfWeek = newDate.getDay();
  // If it's Sunday, add 7 days, otherwise add days until next Sunday
  const daysToAdd = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  newDate.setDate(newDate.getDate() + daysToAdd);
  return newDate;
};

function isNewWeek(lastResetDate: Date) {
  const now = new Date();
  // If we're past the last reset date, it's a new week
  return now > lastResetDate;
}

function isNewMonth(lastDate: Date, currentDate: Date = new Date()) {
  return lastDate.getMonth() !== currentDate.getMonth() || 
         lastDate.getFullYear() !== currentDate.getFullYear();
}

function getDayKey(date: Date) {
  return date.toISOString().split('T')[0];
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

    const shouldResetWeek = !existingUser?.weekly_reset_at || 
                           isNewWeek(new Date(existingUser?.weekly_reset_at || new Date()));

console.log({
    lastResetDate: existingUser?.weekly_reset_at,
    nextSunday: getNextSunday().toISOString(),
    isNewWeekResult: shouldResetWeek
});

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Calculate streaks and sessions
    const current_streak = existingUser?.last_session_date === todayStr ? 
      (existingUser.current_streak || 1) : 
      (existingUser?.last_session_date === yesterdayStr ? (existingUser.current_streak || 0) + 1 : 1);
    
    const longest_streak = Math.max(current_streak, existingUser?.longest_streak || 0);
    const total_sessions = (existingUser?.total_sessions || 0) + 1;
    
    // Points calculations
    const current_points = shouldResetWeek ? points : (existingUser?.points || 0) + points;
    const total_points = (existingUser?.total_points || 0) + points;

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

    const sessions_this_week = shouldResetWeek ? 
      1 : 
      (existingUser?.sessions_this_week || 0) + 1;

    const sessions_this_month = shouldResetMonth ? 
      1 : 
      (existingUser?.sessions_this_month || 0) + 1;

    // Badge handling
    let unlocked_badges = Array.isArray(existingUser?.unlocked_badges) 
      ? [...existingUser.unlocked_badges] 
      : [];

    // Unlock streak badges
    if (current_streak >= 5) unlocked_badges = addBadge(unlocked_badges, 'streak_5');
    if (current_streak >= 10) unlocked_badges = addBadge(unlocked_badges, 'streak_10');
    if (current_streak >= 30) unlocked_badges = addBadge(unlocked_badges, 'streak_30');
    if (current_streak >= 90) unlocked_badges = addBadge(unlocked_badges, 'streak_90');
    if (current_streak >= 180) unlocked_badges = addBadge(unlocked_badges, 'streak_180');
    if (current_streak >= 365) unlocked_badges = addBadge(unlocked_badges, 'streak_365');

    // Unlock call badges
    if (total_sessions >= 10) unlocked_badges = addBadge(unlocked_badges, 'calls_10');
    if (total_sessions >= 25) unlocked_badges = addBadge(unlocked_badges, 'calls_25');
    if (total_sessions >= 50) unlocked_badges = addBadge(unlocked_badges, 'calls_50');
    if (total_sessions >= 100) unlocked_badges = addBadge(unlocked_badges, 'calls_100');

    // Activity badges
    if (sessions_today >= 10) unlocked_badges = addBadge(unlocked_badges, 'daily_10');
    if (sessions_this_week >= 50) unlocked_badges = addBadge(unlocked_badges, 'weekly_50');
    if (sessions_this_month >= 100) unlocked_badges = addBadge(unlocked_badges, 'monthly_100');

const current_daily_points = shouldResetWeek ? 
  { [todayKey]: points } : 
  {
    ...(existingUser?.daily_points || {}),
    [todayKey]: ((existingUser?.daily_points || {})[todayKey] || 0) + points
  };

console.log({
    existingDailyPoints: existingUser?.daily_points,
    todayKey,
    existingTodayPoints: ((existingUser?.daily_points || {})[todayKey] || 0),
    newPoints: points,
    calculatedPoints: ((existingUser?.daily_points || {})[todayKey] || 0) + points,
    current_daily_points
});

    const { rows: [updated] } = await pool.sql`
      INSERT INTO user_achievements (
        member_id, 
        user_name, 
        user_picture, 
        team_id,
        points,
        total_points,
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
        ${points},
        ${points},
        1,
        1,
        1,
        ${sessions_today},
        ${sessions_this_week},
        ${sessions_this_month},
        ${todayStr},
        ${JSON.stringify(unlocked_badges)},
        ${getNextSunday().toISOString()},
        ${JSON.stringify(current_daily_points)}
      )
      ON CONFLICT (member_id) DO UPDATE SET
        user_name = EXCLUDED.user_name,
        user_picture = ${userPicture || 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732590120/WhatsApp_Image_2024-11-26_at_04.00.13_58e32347_owfpnt.jpg'},
        team_id = EXCLUDED.team_id,
        points = CASE 
  WHEN ${shouldResetWeek} THEN ${points}
  ELSE user_achievements.points + ${points}
END,
total_points = user_achievements.total_points + ${points},
        total_sessions = user_achievements.total_sessions + 1,
        sessions_today = CASE 
          WHEN user_achievements.last_session_date = ${todayStr} THEN user_achievements.sessions_today + 1
          ELSE 1
        END,
        sessions_this_week = CASE 
          WHEN ${shouldResetWeek} THEN 1
          ELSE user_achievements.sessions_this_week + 1
        END,
        sessions_this_month = CASE 
          WHEN TO_CHAR(user_achievements.last_session_date::date, 'YYYY-MM') != TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN 1
          ELSE user_achievements.sessions_this_month + 1
        END,
        last_session_date = ${today.toISOString()},
        unlocked_badges = ${JSON.stringify(unlocked_badges)},
        weekly_reset_at = ${shouldResetWeek ? getNextSunday().toISOString() : existingUser?.weekly_reset_at || getNextSunday().toISOString()},
        daily_points = ${JSON.stringify(current_daily_points)},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    if (shouldResetWeek) {
      const { rows: finalRankings } = await pool.sql`
        WITH Rankings AS (
          SELECT 
            member_id,
            points,
            DENSE_RANK() OVER (ORDER BY points DESC) as rank
          FROM user_achievements
          WHERE weekly_reset_at = ${updated.weekly_reset_at}
        )
        SELECT *
        FROM Rankings
        WHERE points > 0
        ORDER BY points DESC;
      `;

      const userFinalRank = finalRankings.find(r => r.member_id === memberId)?.rank;
      
      if (userFinalRank && finalRankings.length >= 3) {
        if (userFinalRank === 1) unlocked_badges = addBadge(unlocked_badges, 'league_first');
        if (userFinalRank === 2) unlocked_badges = addBadge(unlocked_badges, 'league_second');
        if (userFinalRank === 3) unlocked_badges = addBadge(unlocked_badges, 'league_third');

        await pool.sql`
          UPDATE user_achievements 
          SET unlocked_badges = ${JSON.stringify(unlocked_badges)}
          WHERE member_id = ${memberId};
        `;
      }
    }

    const { rows: currentRankings } = await pool.sql`
      SELECT 
        member_id,
        DENSE_RANK() OVER (ORDER BY points DESC) as rank
      FROM user_achievements
      WHERE weekly_reset_at = ${updated.weekly_reset_at}
      ORDER BY points DESC;
    `;

    const userRank = currentRankings.find(r => r.member_id === memberId)?.rank;

    return NextResponse.json({
      ...updated,
      rank: userRank
    });
  } catch (error) {
    console.error('Error updating achievements:', error);
    return NextResponse.json({ error: 'Failed to update achievements' }, { status: 500 });
  }
}

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

    // Transform daily points for the chart
    const dailyPointsData = userData?.daily_points || {};
    const chartData = Object.entries(dailyPointsData).map(([date, points]) => ({
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      date,
      you: points
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

    const { rows: weeklyRankings } = await pool.sql`
      SELECT 
        member_id, 
        user_name, 
        user_picture, 
        points, 
        unlocked_badges,
        RANK() OVER (ORDER BY points DESC) as rank
      FROM user_achievements 
      WHERE weekly_reset_at = ${userData?.weekly_reset_at}
      ORDER BY points DESC 
      LIMIT 10;
    `;

    const { rows: teamRankings } = await pool.sql`
      SELECT 
        member_id, 
        user_name, 
        user_picture, 
        total_points as points, 
        unlocked_badges,
        RANK() OVER (ORDER BY total_points DESC) as rank
      FROM user_achievements 
      WHERE team_id = ${userData?.team_id}
      ORDER BY total_points DESC 
      LIMIT 10;
    `;

    return NextResponse.json({
      ...achievementsData,
      userData,
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
