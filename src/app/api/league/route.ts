import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

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

    // Get user's data and team_id
    const { rows: [userData] } = await pool.sql`
      SELECT * FROM user_achievements WHERE member_id = ${memberId};
    `;

    // Weekly rankings
    const { rows: weeklyRankings } = await pool.sql`
      SELECT 
        member_id, 
        user_name, 
        user_picture, 
        points,
        unlocked_badges,
        DENSE_RANK() OVER (ORDER BY points DESC) as rank
      FROM user_achievements 
      WHERE weekly_reset_at = ${userData?.weekly_reset_at}
      ORDER BY points DESC 
      LIMIT 10;
    `;

    // All-time rankings
    const { rows: allTimeRankings } = await pool.sql`
      SELECT 
        member_id, 
        user_name, 
        user_picture, 
        total_points as points,
        unlocked_badges,
        DENSE_RANK() OVER (ORDER BY total_points DESC) as rank
      FROM user_achievements 
      ORDER BY total_points DESC 
      LIMIT 10;
    `;

    // Team rankings (if team_id exists)
    const { rows: teamRankings } = userData?.team_id ? await pool.sql`
      SELECT 
        member_id, 
        user_name, 
        user_picture, 
        total_points as points,
        unlocked_badges,
        DENSE_RANK() OVER (ORDER BY total_points DESC) as rank
      FROM user_achievements 
      WHERE team_id = ${userData.team_id}
      ORDER BY total_points DESC 
      LIMIT 10;
    ` : { rows: [] };

    // Get user's rank in each category if not in top 10
    const getUserRank = async (category: 'weekly' | 'allTime' | 'team') => {
      if (!userData) return null;

      const query = category === 'weekly' ? 
        await pool.sql`
          SELECT count(*) + 1 as rank
          FROM user_achievements
          WHERE points > ${userData.points}
          AND weekly_reset_at = ${userData.weekly_reset_at};
        ` :
        category === 'allTime' ?
        await pool.sql`
          SELECT count(*) + 1 as rank
          FROM user_achievements
          WHERE total_points > ${userData.total_points};
        ` :
        await pool.sql`
          SELECT count(*) + 1 as rank
          FROM user_achievements
          WHERE total_points > ${userData.total_points}
          AND team_id = ${userData.team_id};
        `;

      return query.rows[0].rank;
    };

    // Get user's rank if not in top rankings
    if (!weeklyRankings.find(r => r.member_id === memberId)) {
      const rank = await getUserRank('weekly');
      weeklyRankings.push({
        ...userData,
        rank,
        points: userData.points
      });
    }

    if (!allTimeRankings.find(r => r.member_id === memberId)) {
      const rank = await getUserRank('allTime');
      allTimeRankings.push({
        ...userData,
        rank,
        points: userData.total_points
      });
    }

    if (userData?.team_id && !teamRankings.find(r => r.member_id === memberId)) {
      const rank = await getUserRank('team');
      teamRankings.push({
        ...userData,
        rank,
        points: userData.total_points
      });
    }

    return NextResponse.json({
      weeklyRankings,
      allTimeRankings,
      teamRankings,
      userData
    });

  } catch (error) {
    console.error('Error fetching league data:', error);
    return NextResponse.json({ error: 'Failed to fetch league data' }, { status: 500 });
  }
}

// src/app/mrdky/vision-board-dashboard.tsx (modifications only)
// Add this to your imports at the top
import League from './league';

// Inside your VisionBoardDashboardClient component, replace the existing League component with:
  <League
    activeCategory={activeLeagueCategory}
    setActiveLeagueCategory={setActiveLeagueCategory}
  />

// Make sure the state is defined at the top of your component:
const [activeLeagueCategory, setActiveLeagueCategory] = useState<'weekly' | 'allTime' | 'allTimeTeam'>('weekly');

// Remove any static leagueData declarations since data will now come from the API
