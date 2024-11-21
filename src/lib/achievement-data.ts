export interface Badge {
  days?: number;
  calls?: number;
  count?: number;
  period?: string;
  rank?: string;
  image: string;
  description: string;
  unlocked?: boolean;
  current?: number;
  target?: number;
  tooltipTitle: string;
  tooltipSubtitle: string;
  progress?: number;
}

export const PRACTICE_STREAK_BADGES: Badge[] = [
  { 
    days: 5, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-HWOAO1EUTGSglSzZlSFjHA-dQjZimptRd-0SpN_-6oU5w-removebg-preview-kqCdBji4NtHiKw4VNgVdM4AvaoJTeG.png", 
    description: "5 Day Streak", 
    tooltipTitle: "Practice Rookie",
    tooltipSubtitle: "Practice for 5 consecutive days",
    progress: 0
  },
  { 
    days: 10, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-QHfb4ipTQUu1iR54Vmxo6g-RFBtanJsS0aS2a2tOFHHXg-removebg-preview-v7ErIfzS4KWNaGOsrDHAlKE567RPBl.png", 
    description: "10 Day Streak", 
    tooltipTitle: "Practice Enthusiast",
    tooltipSubtitle: "Keep practicing for 10 days",
    progress: 0
  },
  { 
    days: 30, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-CSU-cRrnTDCAuvGYTSV90w-taY5gPBoQxydiszFPNpDvQ-removebg-preview-icmW2h12SQM5AuIhCFGS6QgVtHH4bl.png", 
    description: "30 Day Streak", 
    tooltipTitle: "Practice Master",
    tooltipSubtitle: "Complete a full month of practice",
    progress: 0
  },
  { 
    days: 90, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-RCaF4tpKT7aJoICZ2L508Q-UCW5RDP4Q4KfvoRnq8NlfA-removebg-preview-uTOgO6F3TcAT7mgifJaah0IMdp7aBL.png", 
    description: "90 Day Streak", 
    tooltipTitle: "Practice Virtuoso",
    tooltipSubtitle: "Stay committed for 90 days",
    progress: 0
  },
  { 
    days: 180, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-L5aDOKYDTgKsB2lxHimuQQ-2xr3cxz6RCeNCL9HhBtylA-removebg-preview-EjyMwQ76jCkYGHpc22uRIkJ4b0c6gu.png", 
    description: "180 Day Streak", 
    tooltipTitle: "Practice Champion",
    tooltipSubtitle: "Maintain practice for 180 days",
    progress: 0
  },
  { 
    days: 365, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-9Ut5P-Z7Q-qcpgWOIlslCA-YQ3T7zHwThCVVysgv9KyEg-removebg-preview-6Gy0yI5Pl0pFnfMYafKQCjqqmtUVEL.png", 
    description: "365 Day Streak", 
    tooltipTitle: "Practice Legend",
    tooltipSubtitle: "Complete a full year of daily practice",
    progress: 0
  }
];

export const CALLS_BADGES: Badge[] = [
  { 
    calls: 10, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.19.01_2cecae84-removebg-preview-HpwJXY8H5IMISoTv4km3ojTHoSZR8l.png", 
    description: "10 Calls", 
    tooltipTitle: "First Steps",
    tooltipSubtitle: "Complete your first 10 calls",
    progress: 0
  },
  { 
    calls: 25, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.19.00_410bcd52-removebg-preview-dlLwx4QulGYXIPJ1SngulFRrwEzsAK.png", 
    description: "25 Calls", 
    tooltipTitle: "Getting Started",
    tooltipSubtitle: "Make 25 successful calls",
    progress: 0
  },
  { 
    calls: 50, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.19.00_e9686083-removebg-preview-MDIRXQ0AssJavrWhCOpsWNpEU5d4Ju.png", 
    description: "50 Calls", 
    tooltipTitle: "Call Enthusiast",
    tooltipSubtitle: "Reach 50 calls milestone",
    progress: 0
  },
  { 
    calls: 100, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.59_aaafd20b-removebg-preview-XjPy3hlhfslMzznTbnidnUwXshcQfA.png", 
    description: "100 Calls", 
    tooltipTitle: "Century Caller",
    tooltipSubtitle: "Hit your first 100 calls",
    progress: 0
  },
  { 
    calls: 250, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.58_e34cbb5f-removebg-preview-a9uNWRXCjGbpOHLSqf3TpeOCzxTRd7.png", 
    description: "250 Calls", 
    tooltipTitle: "Call Expert",
    tooltipSubtitle: "Master 250 calls",
    progress: 0
  },
  { 
    calls: 500, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.59_dac37adb-removebg-preview-hJMSixcu6MZEXimLJmrsyO2temyFDg.png", 
    description: "500 Calls", 
    tooltipTitle: "Call Virtuoso",
    tooltipSubtitle: "Achieve 500 successful calls",
    progress: 0
  },
  { 
    calls: 750, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.57_f7535a53-removebg-preview-Vr88OikuiRNF7hIVXzXNPrsJFX1mpv.png", 
    description: "750 Calls", 
    tooltipTitle: "Elite Caller",
    tooltipSubtitle: "Join the elite with 750 calls",
    progress: 0
  },
  { 
    calls: 1000, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.57_717b1f9c-removebg-preview-NEfGEVDhw3AK6EJSo0gtm42sq28oy2.png", 
    description: "1000 Calls", 
    tooltipTitle: "Call Master",
    tooltipSubtitle: "Reach the impressive 1000 calls",
    progress: 0
  },
  { 
    calls: 1500, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.18.58_44ffd513-removebg-preview-3KJg104tTgbQo53R75ZJIdE4Pv6jBi.png", 
    description: "1500 Calls", 
    tooltipTitle: "Call Legend",
    tooltipSubtitle: "Achieve legendary status with 1500 calls",
    progress: 0
  },
  { 
    calls: 2500, 
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2024-11-07_at_23.19.01_b4416b2f-removebg-preview-wl3Pqdmr7gt9BFVpspJ0ggm41XedWZ.png", 
    description: "2500 Calls", 
    tooltipTitle: "Ultimate Caller",
    tooltipSubtitle: "Reach the pinnacle with 2500 calls",
    progress: 0
  }
];

export const ACTIVITY_BADGES: Badge[] = [
  { 
    count: 10,
    period: "day",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/InBodPWuQrymOXROYwUwow-removebg-preview-IEGWv6kNCTAusDQjfDnJXpHoQRgFQR.png",
    description: "10/Day",
    target: 10,
    tooltipTitle: "Daily Achiever",
    tooltipSubtitle: "Complete 10 activities in one day",
    progress: 0
  },
  { 
    count: 50,
    period: "week",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DuZdTwN_T8SRiCdUHDt-AQ-removebg-preview%20(1)-7g7ItwNB5ISjQHja5mcpjzxc8hr0s7.png",
    description: "50/Week",
    target: 50,
    tooltipTitle: "Weekly Warrior",
    tooltipSubtitle: "Hit 50 activities in a week",
    progress: 0
  },
  { 
    count: 100,
    period: "month",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/73z7d5wLQiyhufwfTdw5OA-removebg-preview%20(1)-5AC5dKLPkTLUI9LEOfALqI2ksNMNzd.png",
    description: "100/Month",
    target: 100,
    tooltipTitle: "Monthly Champion",
    tooltipSubtitle: "Complete 100 activities in a month",
    progress: 0
  }
];

export const LEAGUE_BADGES: Badge[] = [
  { 
    rank: "Bronze",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-large-radiant-bronze-medal-with-a-t0r6ItMuRVOEve22GfVYdw-KxQg20b_SdOR5Y3HVUaVZg-removebg-preview-FQvuwEgYxWGz6qrgC1TDFLJgNCqMTd.png",
    description: "3rd place",
    tooltipTitle: "Bronze League",
    tooltipSubtitle: "Achieve 3rd place in rankings",
    progress: 0
  },
  { 
    rank: "Silver",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-large-radiant-silver-medal-with-a-SF8CEVMrSWaKtCH-SS0KPw-xITb8y53Tw-95YbTOpEHoQ-removebg-preview-U6690RSmf0Tv9j0qzPESh3bBQJKIB4.png",
    description: "2nd place",
    tooltipTitle: "Silver League",
    tooltipSubtitle: "Secure 2nd place in rankings",
    progress: 0
  },
  { 
    rank: "Gold",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-3d-render-of-a-large-radiant-gold-medal-with-a-b-T5VpM4deRuWtnNpknWeXKA-oVpwYeqBTOuOBOCRRskHXg-removebg-preview-o68fcm402jSQQlsuqIHnmTKovqR92D.png",
    description: "1st place",
    tooltipTitle: "Gold League",
    tooltipSubtitle: "Reach the top of the rankings",
    progress: 0
  }
];

// Helper function to map badge data with unlock status
export const mapBadgesWithUnlockStatus = <T extends Badge>(
  badges: T[],
  unlockedItems: any[],
  checkKey: keyof T
): T[] => {
  return badges.map(badge => ({
    ...badge,
    unlocked: unlockedItems.includes(badge[checkKey])
  }));
};
