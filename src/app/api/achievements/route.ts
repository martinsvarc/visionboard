import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { ACHIEVEMENTS } from '@/lib/achievement-data';

const DEFAULT_PROFILE_PICTURE = "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732590120/WhatsApp_Image_2024-11-26_at_04.00.13_58e32347_owfpnt.jpg";

// Helper function to check if it's a new week
function isNewWeek(lastResetDate: Date) {
  const now = new Date();
  return lastResetDate.getUTCDay() > now.getUTCDay() || 
         now.getTime() - lastResetDate.getTime() >= 7 * 24 * 60 * 60 * 1000;
}

// POST endpoint to record sessions and update achievements
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

    // Get current user data
    const { rows: [existingUser] } = await pool.sql`
      SELECT * FROM user_achievements 
      WHERE member_id = ${memberId};
    `;

    // Check if weekly reset is needed
    const shouldResetWeek = !existingUser?.weekly_reset_at || 
                           isNewWeek(new Date(existingUser.weekly_reset_at));

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Calculate new values
    const current_streak = existingUser?.last_session_date === todayStr ? 
      existingUser.current_streak : 
      (existingUser?.last_session_date === yesterdayStr ? existingUser.current_streak + 1 : 1);
    
    const longest_streak = Math.max(current_streak, existingUser?.longest_streak || 0);
    const total_sessions = (existingUser?.total_sessions || 0) + 1;
    const sessions_today = existingUser?.last_session_date === todayStr ? 
      existingUser.sessions_today + 1 : 1;
    const sessions_this_week = shouldResetWeek ? 1 : existingUser?.sessions_this_week + 1;
    const sessions_this_month = today.getMonth() === new Date(existingUser?.last_session_date).getMonth() ?
      existingUser?.sessions_this_month + 1 : 1;
    const total_points = (existingUser?.total_points || 0) + (points || 0);
    const current_points = shouldResetWeek ? (points || 0) : (existingUser?.points || 0) + (points || 0);

    // Calculate achievements to unlock
    let unlocked_badges = existingUser?.unlocked_badges || [];
    
    // Streak achievements
    if (current_streak >= 5) unlocked_badges = addBadge(unlocked_badges, 'streak_5');
    if (current_streak >= 10) unlocked_badges = addBadge(unlocked_badges, 'streak_10');
    if (current_streak >= 30) unlocked_badges = addBadge(unlocked_badges, 'streak_30');
    if (current_streak >= 90) unlocked_badges = addBadge(unlocked_badges, 'streak_90');
    if (current_streak >= 180) unlocked_badges = addBadge(unlocked_badges, 'streak_180');
    if (current_streak >= 365) unlocked_badges = addBadge(unlocked_badges, 'streak_365');

    // Call achievements
    if (total_sessions >= 10) unlocked_badges = addBadge(unlocked_badges, 'calls_10');
    if (total_sessions >= 25) unlocked_badges = addBadge(unlocked_badges, 'calls_25');
    if (total_sessions >= 50) unlocked_badges = addBadge(unlocked_badges, 'calls_50');
    if (total_sessions >= 100) unlocked_badges = addBadge(unlocked_badges, 'calls_100');
    // Add more call milestones...

    // Activity achievements
    if (sessions_today >= 10) unlocked_badges = addBadge(unlocked_badges, 'daily_10');
    if (sessions_this_week >= 50) unlocked_badges = addBadge(unlocked_badges, 'weekly_50');
    if (sessions_this_month >= 100) unlocked_badges = addBadge(unlocked_badges, 'monthly_100');

    // Update user data
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
        ${current_points},
        ${total_points},
        ${current_streak},
        ${longest_streak},
        ${total_sessions},
        ${sessions_today},
        ${sessions_this_week},
        ${sessions_this_month},
        ${todayStr},
        ${JSON.stringify(unlocked_badges)},
        ${shouldResetWeek ? today.toISOString() : existingUser?.weekly_reset_at || today.toISOString()}
      )
      ON CONFLICT (member_id) 
      DO UPDATE SET
        user_name = EXCLUDED.user_name,
        user_picture = EXCLUDED.user_picture,
        team_id = EXCLUDED.team_id,
        points = EXCLUDED.points,
        total_points = EXCLUDED.total_points,
        current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        total_sessions = EXCLUDED.total_sessions,
        sessions_today = EXCLUDED.sessions_today,
        sessions_this_week = EXCLUDED.sessions_this_week,
        sessions_this_month = EXCLUDED.sessions_this_month,
        last_session_date = EXCLUDED.last_session_date,
        unlocked_badges = EXCLUDED.unlocked_badges,
        weekly_reset_at = EXCLUDED.weekly_reset_at,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    // Check weekly rankings and update league badges
    const { rows: weeklyRankings } = await pool.sql`
      SELECT member_id, points,
             RANK() OVER (ORDER BY points DESC) as rank
      FROM user_achievements
      WHERE weekly_reset_at = ${updated.weekly_reset_at};
    `;

    const userRank = weeklyRankings.find(r => r.member_id === memberId)?.rank;
    
    if (userRank === 1) unlocked_badges = addBadge(unlocked_badges, 'league_first');
    if (userRank === 2) unlocked_badges = addBadge(unlocked_badges, 'league_second');
    if (userRank === 3) unlocked_badges = addBadge(unlocked_badges, 'league_third');

    // If badges were updated, save them
    if (JSON.stringify(unlocked_badges) !== JSON.stringify(updated.unlocked_badges)) {
      await pool.sql`
        UPDATE user_achievements 
        SET unlocked_badges = ${JSON.stringify(unlocked_badges)}
        WHERE member_id = ${memberId};
      `;
    }

    return NextResponse.json({
      ...updated,
      rank: userRank
    });
  } catch (error) {
    console.error('Error updating achievements:', error);
    return NextResponse.json({ error: 'Failed to update achievements' }, { status: 500 });
  }
}

// GET endpoint to retrieve achievements and rankings
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

    // Get user data and rankings
    const { rows: [userData] } = await pool.sql`
      SELECT * FROM user_achievements WHERE member_id = ${memberId};
    `;

// Add this section right here, after getting userData but before getting rankings
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
      leagueAchievements: ACHIEVEMENTS.league.map(badge => ({
        ...badge,
        unlocked: userData?.league_rank === badge.rank?.toString() || false
      }))
    };

    // Get weekly rankings
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


    // Get all-time rankings
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

    // Get team rankings
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

// Helper function to add a badge if it doesn't exist
function addBadge(badges: string[], newBadge: string): string[] {
  return badges.includes(newBadge) ? badges : [...badges, newBadge];
}
