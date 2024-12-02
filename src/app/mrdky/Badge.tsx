import { useEffect, useRef } from 'react'

interface BadgeProps {
  badges?: string[]
}

export function Badge({ badges = [] }: BadgeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || badges.length === 0) return
    
    const totalWidth = container.scrollWidth
    const duration = totalWidth * 37.5 // 25% faster (reduced from 50 to 37.5)
    
    const keyframes = `
      @keyframes slide {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `
    const styleElement = document.createElement('style')
    styleElement.innerHTML = keyframes
    document.head.appendChild(styleElement)
    container.style.animation = `slide ${duration}ms linear infinite`
    
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [badges])

  if (badges.length === 0) {
    return null
  }

  return (
    <div className="relative w-24 h-8 overflow-hidden" aria-label="User badges">
      <div 
        ref={containerRef}
        className="absolute inset-0 flex whitespace-nowrap"
      >
        {[...badges, ...badges].map((badge, index) => (
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
  )
}
