'use client'

import * as React from "react"
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSearchParams } from 'next/navigation'
import { RefreshCw, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { CheckedState } from "@radix-ui/react-checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ErrorBoundary, FallbackProps } from "react-error-boundary"

interface Improvement {
  id: number;
  text: string;
}

const colors = ["#fbb350", "#51c1a9", "#556bc7"]

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="text-red-500 p-4">
      <p>Something went wrong:</p>
      <pre className="text-sm">{error.message}</pre>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  )
}

function ImprovementTask({ improvement, color }: { improvement: Improvement; color: string }) {
  const [isChecked, setIsChecked] = React.useState<boolean>(false)
  
  const handleCheckedChange = (checked: CheckedState) => {
    setIsChecked(checked === true)
  }
  
  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-[20px] transition-all duration-300"
      style={{ backgroundColor: color }}
    >
      <div className="relative flex items-center justify-center w-8 h-8 rounded-[20px] bg-white bg-opacity-20">
        <Checkbox 
          checked={isChecked}
          onCheckedChange={handleCheckedChange}
          className="h-5 w-5 rounded-lg border-2 border-white data-[state=checked]:bg-transparent data-[state=checked]:border-white"
        />
        {isChecked && (
          <Check className="h-4 w-4 text-white absolute pointer-events-none" />
        )}
      </div>
      <div className="flex-1 text-sm font-medium text-white">
        {improvement.text}
      </div>
    </div>
  )
}

const MemoizedImprovementTask = React.memo(ImprovementTask)

function PlanComponent() {
  const [improvements, setImprovements] = React.useState<Improvement[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const searchParams = useSearchParams()
  const memberId = searchParams.get('memberId')

  const fetchImprovements = React.useCallback(async () => {
    if (!memberId) return
    
    try {
      setIsRefreshing(true)
      setError(null)

      const response = await fetch(`/api/daily-plans?memberId=${memberId}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setImprovements(data.improvements || [])
    } catch (err) {
      console.error('Error fetching improvements:', err)
      setError('Failed to fetch improvements')
      setImprovements([])
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [memberId])

  React.useEffect(() => {
    fetchImprovements()
  }, [fetchImprovements])

  return (
    <div className="w-full h-[500px] bg-white font-['Montserrat',sans-serif] p-4 sm:p-6 md:p-8">
      <Card className="relative w-full h-full max-w-4xl mx-auto bg-[#f2f3f9] rounded-[20px] overflow-hidden shadow-lg">
        <div className="relative w-full h-full p-2 sm:p-3 md:p-4 lg:p-5">
          <Card className="w-full h-full bg-white rounded-[20px] overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-gray-100">
              <CardTitle className="text-[25px] font-bold text-[#556bc7] leading-[1.3]">
                Daily Personalized Improvement Plan
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-white hover:bg-gray-50 border-gray-200 w-6 h-6 p-1 rounded-[20px]"
                      onClick={fetchImprovements}
                      disabled={isRefreshing}
                      aria-label="Refresh improvement plan"
                    >
                      <RefreshCw className={`w-4 h-4 text-[#556bc7] ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border-gray-200 rounded-[20px]">
                    <p className="text-xs text-gray-600 font-medium">Updates Automatically Every 24 Hours</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="flex-grow w-full overflow-auto space-y-4 p-4">
              {loading ? (
                <p className="text-gray-600 font-medium">Loading improvements...</p>
              ) : error ? (
                <div className="space-y-2">
                  <p className="text-red-500 font-medium">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchImprovements}
                    disabled={isRefreshing}
                    className="text-[#556bc7] border-[#556bc7] hover:bg-[#556bc7] hover:text-white font-bold rounded-[20px]"
                  >
                    Try Again
                  </Button>
                </div>
              ) : improvements.length === 0 ? (
                <p className="text-gray-600 font-medium">No improvements found</p>
              ) : (
                <div className="space-y-2">
                  {improvements.map((improvement, index) => (
                    <MemoizedImprovementTask 
                      key={improvement.id}
                      improvement={improvement}
                      color={colors[index % colors.length]}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanComponent />
    </Suspense>
  )
}
