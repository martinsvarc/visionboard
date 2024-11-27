import { useState, useEffect } from 'react';

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

// Modified League Component
function League({ activeCategory, setActiveLeagueCategory }: { 
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

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        setIsLoading(true);
        const memberId = await getMemberId();
        const response = await fetch(`/api/achievements?memberId=${memberId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch league data');
        }
        
        const data = await response.json();
        
        // Transform the rankings data
        const transformRankings = (rankings: any[]): LeaguePlayer[] => {
          return rankings.map(player => ({
            rank: player.rank,
            name: player.user_name,
            points: player.points,
            avatar: player.user_picture || '/placeholder.svg?height=32&width=32',
            badge: player.unlocked_badges?.length > 0 
              ? getBestBadge(player.unlocked_badges)
              : undefined,
            memberId: player.member_id
          }));
        };

        // Process rankings data
        const weeklyPlayers = transformRankings(data.weeklyRankings);
        const allTimePlayers = transformRankings(data.allTimeRankings);
        const teamPlayers = transformRankings(data.teamRankings);

        // Find current user in each category
        const findUserInRankings = (rankings: LeaguePlayer[]) => 
          rankings.find(player => player.memberId === memberId) || null;

        setLeagueData({
          weekly: weeklyPlayers,
          allTime: allTimePlayers,
          allTimeTeam: teamPlayers
        });

        setCurrentUser(findUserInRankings(
          activeCategory === 'weekly' ? weeklyPlayers :
          activeCategory === 'allTime' ? allTimePlayers :
          teamPlayers
        ));

      } catch (error) {
        console.error('Error fetching league data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagueData();
  }, [activeCategory]);

  // Helper function to get the most prestigious badge
  const getBestBadge = (unlocked_badges: string[]): string => {
    // Priority order of badges
    const badgePriority = [
      'league_first', 'league_second', 'league_third',
      'streak_365', 'streak_180', 'streak_90', 'streak_30', 'streak_10', 'streak_5',
      'calls_2500', 'calls_1500', 'calls_1000', 'calls_750', 'calls_500', 
      'calls_250', 'calls_100', 'calls_50', 'calls_25', 'calls_10'
    ];

    // Find the first (highest priority) badge that the user has unlocked
    const bestBadge = badgePriority.find(badge => unlocked_badges.includes(badge));
    
    if (!bestBadge) return undefined;
    
    // Return the corresponding badge image from achievement-data.ts
    const allAchievements = {
      ...ACHIEVEMENTS.streak,
      ...ACHIEVEMENTS.calls,
      ...ACHIEVEMENTS.league
    };
    
    const badgeData = Object.values(allAchievements).find(b => b.id === bestBadge);
    return badgeData?.image;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Get current category data
  const categoryData = leagueData[activeCategory];
  const topPlayer = categoryData[0];

  return (
    <Card className="p-3 bg-white rounded-[20px] shadow-lg h-full">
      <h2 className="text-2xl font-semibold text-[#556bc7] mb-4">League</h2>
      
      {/* Category buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          onClick={() => setActiveLeagueCategory('weekly')}
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
      
      {/* League Chart */}
      <div className="mb-6">
        <LeagueChart 
          currentUserScore={currentUser?.points || 0}
          topPlayerScore={topPlayer?.points || 0}
        />
      </div>

      {/* Rankings Display */}
      <div className="space-y-2">
        {/* Current User */}
        {currentUser && (
          <div className="bg-[#51c1a9] text-white p-2 rounded-[20px] flex items-center gap-2 text-sm">
            <span className="text-white/90 font-medium">#{currentUser.rank}</span>
            <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full" />
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

        {/* Top 3 Players */}
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
            <img src={player.avatar} alt="" className="w-8 h-8 rounded-full" />
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
    </Card>
  );
}

export default League;
