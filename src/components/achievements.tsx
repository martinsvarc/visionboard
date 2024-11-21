import React from 'react';
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Badge } from '@/lib/achievement-data';

interface AchievementSectionProps {
  title: string;
  currentStreak?: number;
  nextMilestone?: number;
  progress?: number;
  achievements: Badge[];
  description?: string;
  showIndividualProgress?: boolean;
}

const AchievementGrid = ({ achievements, showIndividualProgress = false }: { achievements: Badge[], showIndividualProgress?: boolean }) => {
  return (
    <div className="grid grid-cols-5 gap-4">
      {achievements.map((achievement, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger className="w-full">
              <div className="space-y-1">
                <div className={`relative transition-all duration-300 hover:scale-110 ${
                  !achievement.unlocked ? "opacity-50 grayscale" : ""
                }`}>
                  <div className="relative w-12 h-12 mx-auto">
                    <Image
                      src={achievement.image}
                      alt={achievement.description}
                      fill
                      className="object-contain drop-shadow-md"
                      unoptimized
                    />
                  </div>
                  {!achievement.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/80 backdrop-blur-sm rounded-full p-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-slate-400"
                        >
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                {showIndividualProgress && achievement.current !== undefined && achievement.target !== undefined && (
                  <Progress 
                    value={(achievement.current / achievement.target) * 100} 
                    className="h-1 w-full bg-white/50 [&>div]:bg-[#51c1a9] rounded-full" 
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="bg-white p-2 rounded-lg">
                <p className="text-sm font-bold whitespace-nowrap">{achievement.tooltipTitle}</p>
                <p className="text-xs text-slate-500 whitespace-nowrap">{achievement.tooltipSubtitle}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export const AchievementSection = ({ 
  title, 
  currentStreak, 
  nextMilestone, 
  progress, 
  achievements, 
  description, 
  showIndividualProgress 
}: AchievementSectionProps) => {
  return (
    <div className="space-y-4 bg-white p-4 rounded-xl shadow-sm">
      <div>
        <h3 className="text-xl font-bold text-[#556bc7] mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-slate-600">{description}</p>
        )}
      </div>
      {(currentStreak !== undefined && nextMilestone !== undefined) && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Current: {currentStreak} {currentStreak === 1 ? 'day' : 'days'}</span>
            <span>Next: {nextMilestone} days</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-white/50 [&>div]:bg-[#51c1a9] rounded-full" 
          />
        </div>
      )}
      <AchievementGrid 
        achievements={achievements} 
        showIndividualProgress={showIndividualProgress}
      />
    </div>
  );
};

export default AchievementSection;
