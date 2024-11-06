'use client'

import * as React from "react"
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSearchParams } from 'next/navigation'
import { RefreshCw, TrendingUp } from "lucide-react"

interface Improvement {
  id: number;
  text: string;
}

function ImprovementComponent() {
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
    <div className="min-h-[400px] w-full p-6 bg-primary">
      <Card className="flex-1 min-w-[350px] bg-primary-foreground/10 backdrop-blur-md border-primary-foreground/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-primary-foreground/5">
          <CardTitle className="text-sm font-medium text-primary-foreground/90">Areas of Improvement</CardTitle>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20 w-6 h-6 p-1"
            onClick={fetchImprovements}
            disabled={isRefreshing}
            title="Updates Automatically Every 24 Hours"
          >
            <RefreshCw className={`h-4 w-4 text-primary-foreground/90 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {loading ? (
            <p className="text-primary-foreground/90">Loading improvements...</p>
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
            <p className="text-primary-foreground/90">No improvements found</p>
          ) : (
            <ul className="space-y-2">
              {improvements.map((improvement) => (
                <li 
                  key={improvement.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-all duration-300 backdrop-blur-sm border border-primary-foreground/10"
                >
                  <TrendingUp className="w-5 h-5 text-primary-foreground/70" />
                  <span className="flex-1 text-sm font-medium text-primary-foreground/90">
                    {improvement.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImprovementComponent />
    </Suspense>
  );
}
