'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ACHIEVEMENTS } from '@/lib/achievement-data';
import { cn } from "@/lib/utils"
import { LeagueChart } from '@/components/LeagueChart'

const getMemberId = async () => {
  try {
    // Try Memberstack first
    const memberstack = (window as any).memberstack;
    if (memberstack) {
      const member = await memberstack.getCurrentMember();
      if (member) return member.id;
    }
    
    // Fallback to URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('memberId');
    if (memberId) return memberId;
    
    // Final fallback
    return 'test123';
  } catch (error) {
    console.log('Using test member ID');
    return 'test123';
  }
};

interface LeagueRankings {
  weekly: LeaguePlayer[];
  allTime: LeaguePlayer[];
  allTimeTeam: LeaguePlayer[];
}

interface LeaguePlayer {
  rank: number;
  name: string;
  points: number;
  avatar: string;
  badge?: string;
  memberId: string;
}

interface LeagueApiResponse {
  weeklyRankings: {
    member_id: string;
    user_name: string;
    user_picture: string;
    points: number;
    unlocked_badges: string;
    rank: number;
  }[];
  allTimeRankings: {
    member_id: string;
    user_name: string;
    user_picture: string;
    points: number;
    unlocked_badges: string;
    rank: number;
  }[];
  teamRankings: {
    member_id: string;
    user_name: string;
    user_picture: string;
    points: number;
    unlocked_badges: string;
    rank: number;
  }[];
  userData: {
    member_id: string;
    user_name: string;
    user_picture: string;
    points: number;
    total_points: number;
    unlocked_badges: string;
    team_id?: string;
  } | null;
}

const getImageUrl = (url: string, memberId: string) => {
  const timestamp = new Date().getTime();
  if (url?.includes('cloudinary')) {
    return `${url}?t=${timestamp}`;
  }
  return `${url}?userId=${memberId}&t=${timestamp}`;
};

function League({ 
  activeCategory, 
  setActiveLeagueCategory 
}: { 
  activeCategory: 'weekly' | 'allTime' | 'allTimeTeam', 
  setActiveLeagueCategory: (category: 'weekly' | 'allTime' | 'allTimeTeam') => void 
}) {
  const [leagueData, setLeagueData] = useState<LeagueRankings>({
    weekly: [],
    allTime: [],
    allTimeTeam: []
  });
  const [currentUser, setCurrentUser] = useState<LeaguePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const getBestBadge = (unlocked_badges: string | null | undefined): string | undefined => {
    if (!unlocked_badges) return undefined;
    
    try {
      const badges = unlocked_badges.split(',');
      const lastBadge = badges[badges.length - 1];
      
      if (lastBadge.includes('league_')) {
        const badge = ACHIEVEMENTS.league.find(b => b.id === lastBadge);
        return badge?.image;
      }
      if (lastBadge.includes('streak_')) {
        const badge = ACHIEVEMENTS.streak.find(b => b.id === lastBadge);
        return badge?.image;
      }
      if (lastBadge.includes('calls_')) {
        const badge = ACHIEVEMENTS.calls.find(b => b.id === lastBadge);
        return badge?.image;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error processing badge:', error);
      return undefined;
    }
  };

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        setIsLoading(true);
        const memberId = await getMemberId();
        const response = await fetch(`/api/achievements?memberId=${memberId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch league data');
        }
        
        const data = await response.json() as LeagueApiResponse;
        
        if (!data.userData) {
          setIsNewUser(true);
          setCurrentUser(null);
          setLeagueData({
            weekly: [],
            allTime: [],
            allTimeTeam: []
          });
          return;
        }

        setIsNewUser(false);
        
        const transformRankings = (rankings: any[]): LeaguePlayer[] => {
          return rankings.map(player => ({
            rank: player.rank,
            name: player.user_name,
            points: player.points || 0,
            avatar: getImageUrl(
              player.user_picture || 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732590120/WhatsApp_Image_2024-11-26_at_04.00.13_58e32347_owfpnt.jpg',
              player.member_id
            ),
            badge: player.unlocked_badges?.length > 0 
              ? getBestBadge(player.unlocked_badges)
              : undefined,
            memberId: player.member_id
          }));
        };

        const weeklyPlayers = transformRankings(data.weeklyRankings);
        const allTimePlayers = transformRankings(data.allTimeRankings);
        const teamPlayers = transformRankings(data.teamRankings);

        setLeagueData({
          weekly: weeklyPlayers,
          allTime: allTimePlayers,
          allTimeTeam: teamPlayers
        });

        const findUserInRankings = (rankings: LeaguePlayer[]) => 
          rankings.find(player => player.memberId === memberId) || null;

        setCurrentUser(findUserInRankings(
          activeCategory === 'weekly' ? weeklyPlayers :
          activeCategory === 'allTime' ? allTimePlayers :
          teamPlayers
        ));

      } catch (error) {
        console.error('Error fetching league data:', error);
        setError('Failed to load league data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagueData();
  }, [activeCategory]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Card className="p-3 bg-white rounded-[20px] shadow-lg h-full">
        <div className="text-red-500">{error}</div>
      </Card>
    );
  }

  const categoryData = leagueData[activeCategory];
  const topPlayer = categoryData[0];

  return (
    <Card className="p-3 bg-white rounded-[20px] shadow-lg h-full">
      <h2 className="text-2xl font-semibold text-[#556bc7] mb-4">League</h2>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          onClick={() => setActiveLeagueCategory('weekly')}
          aria-label="Weekly League"
          className={cn(
            "flex-1 px-4 py-2 text-base font-medium transition-colors rounded-full",
            activeCategory === 'weekly' 
              ? "bg-[#fbb350] text-white hover:bg-[#fbb350]/90" 
              : "bg-transparent text-gray-500 hover:bg-gray-100"
          )}
        >
          Weekly League
        </Button>
        <Button 
          onClick={() => setActiveLeagueCategory('allTime')}  
          aria-label="All Time"
          className={cn(
            "flex-1 px-4 py-2 text-base font-medium transition-colors rounded-full",
            activeCategory === 'allTime' 
              ? "bg-[#fbb350] text-white hover:bg-[#fbb350]/90" 
              : "bg-transparent text-gray-500 hover:bg-gray-100"
          )}
        >
          All Time
        </Button>
        <Button 
          onClick={() => setActiveLeagueCategory('allTimeTeam')}
          aria-label="All Time Team"
          className={cn(
            "flex-1 px-4 py-2 text-base font-medium transition-colors rounded-full",
            activeCategory === 'allTimeTeam' 
              ? "bg-[#fbb350] text-white hover:bg-[#fbb350]/90" 
              : "bg-transparent text-gray-500 hover:bg-gray-100"
          )}
        >
          All Time Team
        </Button>
      </div>

      {isNewUser ? (
        <div className="bg-[#51c1a9]/10 p-4 rounded-[20px] mb-6 text-center">
          <p className="text-[#51c1a9] font-medium mb-2">Welcome to the League! 🎉</p>
          <p className="text-gray-600">Start sessions to earn points and compete with others</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <LeagueChart 
              currentUserScore={currentUser?.points || 0}
              topPlayerScore={topPlayer?.points || 0}
            />
          </div>

          <div className="space-y-2">
            {currentUser && (
              <div className="bg-[#51c1a9] text-white p-2 rounded-[20px] flex items-center gap-2 text-sm">
                <span className="text-white/90 font-medium">#{currentUser.rank}</span>
                <img 
                  src={currentUser.avatar} 
                  alt="" 
                  className="w-8 h-8 rounded-full" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732590120/WhatsApp_Image_2024-11-26_at_04.00.13_58e32347_owfpnt.jpg'
                  }}
                />
                <div className="flex items-center gap-1">
                  <span className="font-medium">{currentUser.name}</span>
                  {currentUser.badge && (
                    <img 
                      src={currentUser.badge} 
                      alt="Badge" 
                      className="w-5 h-5" 
                    />
                  )}
                </div>
                <span className="ml-auto font-medium">{currentUser.points} pts</span>
              </div>
            )}

            <h3 className="text-base font-semibold text-[#556bc7] mt-4 mb-2">Top 3 places</h3>

            {categoryData.slice(0, 3).map((player, index) => (
              <div 
                key={player.memberId} 
                className={cn(
                  "p-2 rounded-[20px] flex items-center gap-2 text-sm border",
                  index === 0 ? "border-[#fbb350] text-[#fbb350]" :
                  index === 1 ? "border-[#556bc7] text-[#556bc7]" :
                  "border-[#f97316] text-[#f97316]"
                )}
              >
                <span className="font-medium">#{player.rank}</span>
                <img 
                  src={player.avatar} 
                  alt="" 
                  className="w-8 h-8 rounded-full" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732590120/WhatsApp_Image_2024-11-26_at_04.00.13_58e32347_owfpnt.jpg'
                  }}
                />
                <div className="flex items-center gap-1">
                  <span className="font-medium">{player.name}</span>
                  {player.badge && (
                    <img 
                      src={player.badge} 
                      alt="Badge" 
                      className="w-5 h-5" 
                    />
                  )}
                </div>
                <span className="ml-auto font-medium">{player.points} pts</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

export default League;
