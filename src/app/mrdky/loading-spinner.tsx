'use client'
import Image from 'next/image'

// Add this style block right after your imports and before the component
const styles = {
  container: {
    minHeight: '600px',
    height: '600px'
  }
}

const LoadingSpinner = () => {
  return (
    // Replace your existing outer div with this one
    <div 
      className="flex items-center justify-center w-full py-20 bg-transparent transition-all duration-300 ease-in-out"
      style={styles.container}
    >
      <div className="relative w-24 h-24" role="status" aria-label="Loading">
        {/* Spinning loader */}
        <svg
          className="w-full h-full animate-spin"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#F5F5F5"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          {/* Two animated segments at opposite positions */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#5b06be"
            strokeWidth="12"
            fill="none"
            strokeDasharray="30 95 30 95"
            strokeDashoffset="-15"
            strokeLinecap="round"
          />
        </svg>
        {/* Center image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image 
            src="https://res.cloudinary.com/dmbzcxhjn/image/upload/Colors_logo_gawxfo_kvyozr.png"
            alt="AI Logo"
            width={24}
            height={24}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
