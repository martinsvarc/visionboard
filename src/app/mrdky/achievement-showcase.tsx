"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from 'lucide-react'
import { cn } from "@/lib/utils"
import { 
  PRACTICE_STREAK_BADGES, 
  CALLS_BADGES, 
  ACTIVITY_BADGES, 
  LEAGUE_BADGES,
  mapBadgesWithUnlockStatus,
  type Badge 
} from '@/lib/achievement-data'

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

const getProgressBarColor = (progress: number) => {
  if (progress === 100) return 'bg-[#556bc7]' // Blue Diamond
  if (progress >= 70) return 'bg-[#51c1a9]'   // Green
  if (progress >= 40) return 'bg-[#fbb350]'   // Orange
  return 'bg-[#ef4444]'                       // Red
}

const AchievementContentInner = () => {
  const searchParams = useSearchParams();
  const memberId = searchParams.get('memberId') || 'default';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [activeCategory, setActiveCategory] = useState('practice-streak');
  const [activeTooltipId, setActiveTooltipId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[280px] md:h-[320px] lg:h-[360px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[280px] md:h-[320px] lg:h-[360px]">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const calculateBadgeProgress = (badge: Badge): Badge => {
    if (badge.unlocked) return { ...badge, progress: 100 };

    let progress = 0;
    if (badge.days && badgeData?.practice_streak) {
      progress = Math.min(100, (badgeData.practice_streak / badge.days) * 100);
    } else if (badge.calls && badgeData?.total_calls) {
      progress = Math.min(100, (badgeData.total_calls / badge.calls) * 100);
    } else if (badge.count && badge.period && badgeData) {
      const current = badge.period === 'day' ? badgeData.daily_calls :
                     badge.period === 'week' ? badgeData.weekly_calls :
                     badge.period === 'month' ? badgeData.monthly_calls : 0;
      progress = Math.min(100, (current / badge.count) * 100);
    }

    return { ...badge, progress: Math.round(progress) };
  };

  const categories: Record<string, Badge[]> = {
    'practice-streak': PRACTICE_STREAK_BADGES.map(badge => ({
      ...badge,
      unlocked: badgeData?.unlocked_badges.practice_streak.includes(badge.days || 0)
    })).map(calculateBadgeProgress),
    
    'completed-calls': CALLS_BADGES.map(badge => ({
      ...badge,
      unlocked: badgeData?.unlocked_badges.completed_calls.includes(badge.calls || 0)
    })).map(calculateBadgeProgress),
    
    'activity-goals': ACTIVITY_BADGES.map(badge => ({
      ...badge,
      unlocked: badgeData?.unlocked_badges.activity_goals.includes(`${badge.period}_${badge.count}`),
      current: badge.period === 'day' ? badgeData?.daily_calls :
              badge.period === 'week' ? badgeData?.weekly_calls :
              badge.period === 'month' ? badgeData?.monthly_calls : 0
    })).map(calculateBadgeProgress),
    
    'league-places': LEAGUE_BADGES.map(badge => ({
      ...badge,
      unlocked: badgeData?.league_rank === badge.rank,
      progress: badgeData?.league_rank === badge.rank ? 100 : 0
    }))
  };

  return (
    <Card className="p-4 bg-white rounded-[20px] shadow-lg md:col-span-2 h-[280px] overflow-hidden">
      <h2 className="text-xl md:text-2xl font-semibold text-[#556bc7] mb-4">Achievement Showcase</h2>
      
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
        {Object.keys(categories).map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'ghost'}
            className={cn(
              "px-3 sm:px-4 py-2 rounded-full whitespace-nowrap text-xs sm:text-sm",
              activeCategory === category 
                ? 'bg-[#fbb350] text-white hover:bg-[#fbb350]/90' 
                : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setActiveCategory(category)}
          >
            {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Button>
        ))}
      </div>

      <div className="h-[180px] relative">
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden pr-2 -mr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-1">
            {categories[activeCategory].map((achievement, index) => (
  <div key={index} className="relative group">
    <div 
      className="relative flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      onMouseEnter={() => setActiveTooltipId(index)}
    >
      <div className="relative w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] md:w-[56px] md:h-[56px]">
        {achievement.image ? (
          <img 
            src={achievement.image} 
            alt={achievement.description} 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
          </div>
        )}
        {!achievement.unlocked && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <Lock className="text-white w-4 h-4" />
          </div>
        )}
      </div>
      <div className="w-full text-center mt-2">
        <div className="text-xs sm:text-sm font-medium mb-1 line-clamp-1 px-1">
          {achievement.description}
        </div>
        <div className="text-xs text-gray-500 mb-1">
          {achievement.progress}%
        </div>
        <div className="h-1.5 w-full max-w-[120px] mx-auto bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-in-out ${
              getProgressBarColor(achievement.progress || 0)
            }`}
            style={{ width: `${achievement.progress || 0}%` }}
          />
        </div>
      </div>
    </div>
                
                {/* Custom Tooltip */}
               <div 
  className={cn(
    "absolute inset-0 z-[100] bg-black/90 backdrop-blur-sm shadow-lg p-2 rounded-lg border border-gray-800 pointer-events-none",
    activeTooltipId === index ? "opacity-100" : "opacity-0"
  )}
>
  <p className="font-medium text-xs sm:text-sm text-white">{achievement.tooltipTitle}</p>
  <p className="text-xs text-gray-400">{achievement.tooltipSubtitle}</p>
</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const AchievementContent = () => {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-[280px] md:h-[320px] lg:h-[360px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <AchievementContentInner />
    </Suspense>
  );
};

export default AchievementContent;
