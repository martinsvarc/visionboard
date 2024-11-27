import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { ACHIEVEMENTS } from '@/lib/achievement-data';

const DEFAULT_PROFILE_PICTURE = "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732590120/WhatsApp_Image_2024-11-26_at_04.00.13_58e32347_owfpnt.jpg";

const getNextSunday = (date: Date = new Date()) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  // Add days until we reach Sunday
  while (newDate.getDay() !== 0) {
    newDate.setDate(newDate.getDate() + 1);
  }
  // If the date is today and it's Sunday, add 7 days to get next Sunday
  if (newDate.getDay() === 0 && newDate.getDate() === new Date().getDate()) {
    newDate.setDate(newDate.getDate() + 7);
  }
  return newDate;
};

// Updated weekly reset logic to use Sunday as reset day
function isNewWeek(lastResetDate: Date) {
  const now = new Date();
  const lastReset = new Date(lastResetDate);
  
  // Always use Sunday as reset day (0 is Sunday in getDay())
  const daysSinceLastReset = (now.getDay() + 7 - lastReset.getDay()) % 7;
  return daysSinceLastReset >= 7;
}

export async function POST(request: Request) {
  try {
    const { memberId, userName, userPicture = DEFAULT_PROFILE_PICTURE, teamId, points } = await request.json();
    
    if (!memberId || !userName) {
      return NextResponse.json({ error: 'Member ID and username required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const { rows: [existingUser] } = await pool.sql`
      SELECT * FROM user_achievements 
      WHERE member_id = ${memberId};
    `;

    // Set default values for new users
    if (!existingUser) {
      console.log('New user detected:', memberId);
    }

    const shouldResetWeek = !existingUser?.weekly_reset_at || 
                           isNewWeek(new Date(existingUser?.weekly_reset_at || new Date()));

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Calculate new values
    const current_streak = existingUser?.last_session_date === todayStr ? 
      (existingUser.current_streak || 1) : 
      (existingUser?.last_session_date === yesterdayStr ? (existingUser.current_streak || 0) + 1 : 1);
    
    const longest_streak = Math.max(current_streak, existingUser?.longest_streak || 0);
    const total_sessions = (existingUser?.total_sessions || 0) + 1;
    
    // Updated points calculations
    const current_points = shouldResetWeek ? points : (existingUser?.points || 0) + points;
    const total_points = (existingUser?.total_points || 0) + points;
    
    const isNewDay = !existingUser?.last_session_date || 
                    existingUser.last_session_date !== todayStr;

    // Calculate session counts
    const sessions_today = existingUser?.last_session_date === todayStr ? 
    (existingUser?.sessions_today || 0) + 1 : 1;
    const sessions_this_week = shouldResetWeek ? 1 : (existingUser?.sessions_this_week || 0) + 1;
    const sessions_this_month = today.getMonth() === new Date(existingUser?.last_session_date || today).getMonth() ? 
      (existingUser?.sessions_this_month + 1) : 1;

    // First, ensure unlocked_badges is an array
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

    // Unlock activity badges
    if (sessions_today >= 10) unlocked_badges = addBadge(unlocked_badges, 'daily_10');
    if (sessions_this_week >= 50) unlocked_badges = addBadge(unlocked_badges, 'weekly_50');
    if (sessions_this_month >= 100) unlocked_badges = addBadge(unlocked_badges, 'monthly_100');

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
        weekly_reset_at
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
        ${sessions_today},  // Use calculated value instead of 1
        ${sessions_this_week},  // Use calculated value instead of 1
        ${sessions_this_month},  // Use calculated value instead of 1
        ${todayStr},
        ${JSON.stringify(unlocked_badges)},  // Use calculated badges instead of '[]'
        ${getNextSunday().toISOString()}
      )
      ON CONFLICT (member_id) DO UPDATE SET
        user_name = EXCLUDED.user_name,
        user_picture = EXCLUDED.user_picture,
        team_id = EXCLUDED.team_id,
        points = user_achievements.points + ${points},
        total_points = user_achievements.total_points + ${points},
        total_sessions = user_achievements.total_sessions + 1,
        sessions_today = CASE 
            WHEN user_achievements.last_session_date = ${todayStr} THEN user_achievements.sessions_today + 1
            ELSE 1
        END,
        sessions_this_week = user_achievements.sessions_this_week + 1,
        sessions_this_month = user_achievements.sessions_this_month + 1,
        last_session_date = ${todayStr},
        unlocked_badges = ${JSON.stringify(unlocked_badges)},
        weekly_reset_at = ${shouldResetWeek ? getNextSunday().toISOString() : existingUser?.weekly_reset_at || getNextSunday().toISOString()},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    if (shouldResetWeek) {
      // Get current rankings right before reset
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
      
      // Only award league badges if user has points and is in top 3
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

// Add this section right here
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

// GET endpoint remains exactly the same
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

    const achievementsData = {
      streakAchievements: ACHIEVEMENTS.streak.map(badge => ({
        ...badge,
        unlocked: userData?.unlocked_badges?.includes(`streak_${badge.target}`) || false
      })),
      
      callAchievements: ACHIEVEMENTS.calls.map(badge => ({
        ...badge,
        unlocked: userData?.unlocked_badges?.includes(`calls_${badge.target}`) || false
      })),
      
      activityAchievements: ACHIEVEMENTS.activity.map(badge => ({
        ...badge,
        unlocked: userData?.unlocked_badges?.includes(`${badge.period}_${badge.target}`) || false
      })),
      
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
    };  // Add this closing brace and semicolon

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

    const { rows: allTimeRankings } = await pool.sql`
      SELECT 
        member_id, 
        user_name, 
        user_picture, 
        total_points as points, 
        unlocked_badges,
        RANK() OVER (ORDER BY total_points DESC) as rank
      FROM user_achievements 
      ORDER BY total_points DESC 
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
      allTimeRankings,
      teamRankings
    });

  } catch (error) {
    console.error('Error getting achievements:', error);
    return NextResponse.json({ error: 'Failed to get achievements' }, { status: 500 });
  }
}

function addBadge(badges: string[], newBadge: string): string[] {
  return badges.includes(newBadge) ? badges : [...badges, newBadge];
}
