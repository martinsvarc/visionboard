import { useEffect, useRef } from 'react';

interface BadgeProps {
  badges?: string[];
}

export function Badge({ badges = [] }: BadgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || badges.length <= 3) return;

    const totalWidth = (container.firstChild as HTMLElement)?.offsetWidth || 0;
    const duration = totalWidth * 50;

    const keyframes = `
      @keyframes infiniteScroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${totalWidth}px); }
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
          <div key={`static-${index}`} className="w-8 h-8 flex items-center justify-center">
            <img src={badge} alt="Achievement badge" className="w-6 h-6 object-contain" />
          </div>
        ))}
      </div>
    );
  }

  const duplicatedBadges = [...badges, ...badges, ...badges];

  return (
    <div className="relative w-24 h-8 overflow-hidden" aria-label="User badges">
      <div ref={containerRef} className="absolute flex">
        <div className="flex">
          {duplicatedBadges.map((badge, index) => (
            <div key={`scroll-${index}`} className="w-8 h-8 flex items-center justify-center">
              <img src={badge} alt="Achievement badge" className="w-6 h-6 object-contain" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
