'use client'

import * as React from "react"
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSearchParams } from 'next/navigation'
import { RefreshCw } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface Improvement {
  id: number;
  text: string;
}

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

      const response = await fetch(`/api/track-improvement?memberId=${memberId}`);
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
    <div className="min-h-[500px] w-full p-8 bg-blue-600">
      <Card className="flex-1 min-w-[350px] backdrop-blur-xl bg-white/10 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-white/20 bg-white/5">
          <div>
            <CardTitle className="text-sm font-medium text-white/90 mt-1">Daily Personalized Improvement Plan</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-white/10 hover:bg-white/20 border-white/20 w-6 h-6 p-1 -mt-1"
            onClick={fetchImprovements}
            disabled={isRefreshing}
            title="Updates Automatically Every 24 Hours"
          >
            <RefreshCw className={`w-4 h-4 text-white/90 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {loading ? (
            <p className="text-white/90">Loading improvements...</p>
          ) : error ? (
            <div className="space-y-2">
              <p className="text-red-500">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchImprovements}
                disabled={isRefreshing}
              >
                Try Again
              </Button>
            </div>
          ) : improvements.length === 0 ? (
            <p className="text-white/90">No improvements found</p>
          ) : (
            <div className="space-y-2">
              {improvements.map((improvement) => (
                <div 
                  key={improvement.id}
                  className="flex items-center gap-3 p-3 rounded-lg backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 shadow-[inset_0_0_1px_rgba(255,255,255,0.2)]"
                >
                  <Checkbox className="bg-white/10 border-white/20 data-[state=checked]:bg-white/20 data-[state=checked]:text-white" />
                  <div className="flex-1 text-sm font-medium text-white/90">
                    {improvement.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
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
