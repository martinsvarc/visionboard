// src/components/custom-calendar.tsx
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface CustomCalendarProps {
  streakData: {
    current: number;
    consistency: string;
    longest: number;
  };
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ streakData }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 10, 17));
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const generateCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="text-center py-2.5 text-sm text-gray-300">
          {getDaysInMonth(new Date(currentYear, currentMonth - 1)) - firstDay + i + 1}
        </div>
      );
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isStreak = currentMonth === 10 && day >= 11 && day <= 16;
      const isCurrent = currentMonth === 10 && (day === 17 || day === 18);
      days.push(
        <div
          key={day}
          className={cn(
            "text-center py-2.5 text-sm rounded-[16px] font-medium",
            isStreak ? "bg-[#51c1a9] text-white" : "",
            isCurrent ? "border-2 border-[#556bc7] text-[#556bc7]" : "",
          )}
        >
          {day}
        </div>
      );
    }

    // Add empty cells for the remaining days
    const remainingDays = 42 - (days.length); // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push(
        <div key={`next-${i}`} className="text-center py-2.5 text-sm text-gray-300">
          {i}
        </div>
      );
    }

    return days;
  };

  return (
    <Card className="p-3 bg-white rounded-[20px] shadow-lg flex flex-col h-full">
      <h2 className="text-2xl font-semibold text-[#556bc7] mb-6">Calendar & Streak</h2>
      <div className="flex gap-3 mb-6">
        <div className="bg-[#556bc7] text-white px-3 py-2 rounded-[20px] flex-1">
          <div className="text-xs font-medium text-center">Current</div>
          <div className="text-2xl font-bold text-center">{streakData.current}</div>
        </div>
        <div className="bg-[#51c1a9] text-white px-3 py-2 rounded-[20px] flex-1">
          <div className="text-xs font-medium text-center">Consistency</div>
          <div className="text-2xl font-bold text-center">{streakData.consistency}</div>
        </div>
        <div className="bg-[#fbb350] text-white px-3 py-2 rounded-[20px] flex-1">
          <div className="text-xs font-medium text-center">Longest</div>
          <div className="text-2xl font-bold text-center">{streakData.longest}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-transparent"
          onClick={handlePrevMonth}
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </Button>
        <div className="text-base font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-transparent"
          onClick={handleNextMonth}
        >
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm text-gray-400 font-medium mb-2">
            {day}
          </div>
        ))}
        {generateCalendarDays()}
      </div>
    </Card>
  );
};
