import { useEffect, useRef } from 'react';

interface BadgeProps {
  badges?: string[];
}

export function Badge({ badges = [] }: BadgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || badges.length <= 3) return;

    const totalWidth = container.scrollWidth / 3;  // Divide by 3 since we triplicate
    const duration = totalWidth * 50;

    const keyframes = `
      @keyframes infiniteScroll {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-33.33%, 0, 0); }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.innerHTML = keyframes;
    document.head.appendChild(styleElement);
    
    container.style.animation = `infiniteScroll ${duration}ms linear infinite`;

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [badges]);

  if (badges.length <= 3) {
    return (
      <div className="flex">
        {badges.map((badge, index) => (
          <div key={index} className="w-8 h-8 flex items-center justify-center">
            <img src={badge} alt="Achievement badge" className="w-6 h-6 object-contain" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-24 h-8 overflow-hidden" aria-label="User badges">
      <div 
        ref={containerRef}
        className="absolute inset-0 flex whitespace-nowrap"
      >
        {[...badges, ...badges, ...badges].map((badge, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
          >
            <img 
              src={badge} 
              alt="Achievement badge" 
              className="w-6 h-6 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
