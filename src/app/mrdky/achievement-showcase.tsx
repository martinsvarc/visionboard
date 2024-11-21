"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from 'next/navigation'
import { Montserrat } from 'next/font/google'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AchievementSection } from '@/components/achievements'
import { 
  PRACTICE_STREAK_BADGES, 
  CALLS_BADGES, 
  ACTIVITY_BADGES, 
  LEAGUE_BADGES,
  mapBadgesWithUnlockStatus 
} from './achievement-data'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '700'],
})

interface BadgeData {
  memberId: string;
  practice_streak: number;
  total_calls: number;
  daily_calls: number;
  weekly_calls: number;
  monthly_calls: number;
  current_week_points: number;
  league_rank: string;
  unlocked_badges: {
    practice_streak: number[];
    completed_calls: number[];
    activity_goals: string[];
  };
}

export const AchievementContent = () => {
  const searchParams = useSearchParams();
  const memberId = searchParams.get('memberId') || 'default';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        // This is where you'll integrate your database call
        const response = await fetch(`/api/badges?memberId=${memberId}`);
        if (!response.ok) throw new Error('Failed to fetch badges');
        const data = await response.json();
        setBadgeData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [memberId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Map badges with their unlock status from database data
  const practiceStreakBadges = mapBadgesWithUnlockStatus(
    PRACTICE_STREAK_BADGES,
    badgeData?.unlocked_badges.practice_streak || [],
    'days'
  );

  const callsBadges = mapBadgesWithUnlockStatus(
    CALLS_BADGES,
    badgeData?.unlocked_badges.completed_calls || [],
    'calls'
  );

  const activityBadges = ACTIVITY_BADGES.map(badge => ({
    ...badge,
    unlocked: badgeData?.unlocked_badges.activity_goals.includes(`${badge.period}_${badge.count}`),
    current: badgeData?.[`${badge.period}_calls` as keyof BadgeData] || 0
  }));

  const leagueBadges = LEAGUE_BADGES.map(badge => ({
    ...badge,
    unlocked: badgeData?.league_rank === badge.rank
  }));

  return (
    <div className={`${montserrat.className} bg-white min-h-screen flex items-center justify-center p-8`}>
      <div className="bg-[#f2f3f9] p-8 rounded-xl shadow-lg w-full max-w-4xl">
        <Card className="w-full overflow-hidden bg-white border-white/20 shadow-sm">
          <CardHeader className="border-b border-white/20 p-3">
            <CardTitle className="text-2xl font-extrabold text-[#556bc7] text-center">
              Achievement Showcase
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AchievementSection
                title="Practice Streak"
                currentStreak={badgeData?.practice_streak || 0}
                nextMilestone={90}
                progress={(badgeData?.practice_streak || 0) / 90 * 100}
                achievements={practiceStreakBadges}
              />
              <AchievementSection
                title="Completed Calls"
                currentStreak={badgeData?.total_calls || 0}
                nextMilestone={100}
                progress={(badgeData?.total_calls || 0) / 100 * 100}
                achievements={callsBadges}
              />
              <AchievementSection
                title="Activity Goals"
                description="Daily, Weekly, Monthly"
                achievements={activityBadges}
                showIndividualProgress
              />
              <AchievementSection
                title="League Places"
                description={`Current League: ${badgeData?.league_rank || 'Bronze'}`}
                achievements={leagueBadges}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main page component
export default function Page() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <AchievementContent />
    </Suspense>
  );
}
