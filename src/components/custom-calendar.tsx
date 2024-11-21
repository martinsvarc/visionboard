// src/components/custom-calendar.tsx
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CustomCalendarProps {
  streakData: {
    current: number;
    consistency: string;
    longest: number;
  };
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ streakData }) => {
  const [date, setDate] = useState<Date>(new Date(2024, 10, 17));

  const modifiers = {
    streak: { from: new Date(2024, 10, 11), to: new Date(2024, 10, 16) },
    current: new Date(2024, 10, 17),
    next: new Date(2024, 10, 18)
  };

  const modifiersClassNames = {
    streak: "bg-[#51c1a9] text-white hover:bg-[#51c1a9] hover:text-white",
    current: "border-2 border-[#556bc7] text-[#556bc7]",
    next: "border-2 border-[#556bc7] text-[#556bc7]"
  };

  return (
    <Card className="p-3 bg-white rounded-[20px] shadow-lg h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-[#556bc7] mb-4">Calendar & Streak</h2>
      
      <div className="flex gap-3 mb-4">
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

      <div className="flex-1 flex">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && setDate(newDate)}
          className="flex-1 flex flex-col"
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          classNames={{
            months: "flex-1 flex flex-col",
            month: "flex-1 flex flex-col justify-between",
            caption: "flex justify-center relative items-center h-8",
            caption_label: "text-base font-semibold",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-transparent"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "flex-1 flex flex-col",
            head_row: "flex w-full mb-2",
            head_cell: "text-sm text-gray-400 font-medium flex-1 text-center",
            row: "flex w-full flex-1",
            cell: "relative flex-1 aspect-square p-0",
            day: "h-full w-full p-0 font-medium hover:bg-gray-100 flex items-center justify-center rounded-[16px]",
            day_today: "text-[#556bc7] font-bold",
            day_selected: "bg-[#556bc7] text-white hover:bg-[#556bc7] hover:text-white",
            day_outside: "text-gray-300",
          }}
        />
      </div>
    </Card>
  );
};
