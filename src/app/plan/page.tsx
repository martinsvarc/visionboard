'use client'

import * as React from "react"
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSearchParams } from 'next/navigation'
import { RefreshCw, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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
  const [isChecked, setIsChecked] = React.useState(false)
  
  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 shadow-sm"
      style={{ backgroundColor: color }}
    >
      <div className="relative flex items-center justify-center">
        <Checkbox 
          checked={isChecked}
          onCheckedChange={setIsChecked}
          className="h-5 w-5 rounded-lg border-2 border-white data-[state=checked]:bg-transparent data-[state=checked]:border-white"
        />
        {isChecked && (
          <Check className="h-4 w-4 text-white absolute pointer-events-none" />
        )}
      </div>
      <div className="flex-1 text-sm font-medium text-white font-montserrat-medium">
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

  const searchParams = useSearchParams();
  const memberId = searchParams.get('memberId');

  const fetchImprovements = React.useCallback(async () => {
    if (!memberId) return;
    
    try {
      setIsRefreshing(true)
      setError(null)

      const response = await fetch(`/api/daily-plans?memberId=${memberId}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setImprovements(data.improvements || []);
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
    <div className="min-h-screen w-full p-8 bg-white flex items-center justify-center">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;800&display=swap');

        .font-montserrat-extrabold {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
        }

        .font-montserrat-medium {
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
        }
      `}</style>
      <div className="bg-[#f2f3f9] p-8 rounded-[2.5rem] shadow-lg">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Card className="flex-1 min-w-[350px] bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-4 border-b border-slate-100">
              <div>
                <CardTitle className="text-base font-montserrat-extrabold text-[#556bc7]">
                  Daily Personalized Improvement Plan
                </CardTitle>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-white hover:bg-slate-50 border-slate-200 w-6 h-6 p-1 -mt-1"
                      onClick={fetchImprovements}
                      disabled={isRefreshing}
                      aria-label="Refresh improvement plan"
                    >
                      <RefreshCw className={`w-4 h-4 text-[#556bc7] ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border-slate-100 text-slate-600 font-montserrat-medium">
                    <p className="text-xs">Updates Automatically Every 24 Hours</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {loading ? (
                <p className="text-slate-600 font-montserrat-medium">Loading improvements...</p>
              ) : error ? (
                <div className="space-y-2">
                  <p className="text-red-500 font-montserrat-medium">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchImprovements}
                    disabled={isRefreshing}
                    className="text-[#556bc7] border-[#556bc7] hover:bg-[#556bc7] hover:text-white font-montserrat-extrabold"
                  >
                    Try Again
                  </Button>
                </div>
              ) : improvements.length === 0 ? (
                <p className="text-slate-600 font-montserrat-medium">No improvements found</p>
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
        </ErrorBoundary>
      </div>
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
