'use client'

import * as React from "react"
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RefreshCw, TrendingUp } from "lucide-react"

const supabase = createClient(
  'https://mmbluqkupxdgkdkmwzvj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYmx1cWt1cHhkZ2tka213enZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0NzgwODcsImV4cCI6MjA0NTA1NDA4N30.5WwH-WwpEKMs0PPvYX0jhMfF3X5mwlFl5IfMTyW48GU'
)

export default function AreasOfImprovement() {
  const [improvements, setImprovements] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const fetchImprovements = React.useCallback(async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('Call Logs')
        .select('improvement')
        .eq('id', 'agent10@example.com') // Using the ID we saw in the test output
        .single()

      if (supabaseError) {
        throw supabaseError
      }

      if (data?.improvement) {
        // If improvement data exists, split it into an array
        const improvementArray = data.improvement.split(',').map(item => item.trim())
        setImprovements(improvementArray)
      } else {
        // Handle the case where improvement is null
        setImprovements([])
      }
    } catch (err) {
      console.error('Error fetching improvements:', err)
      setError('Failed to fetch improvements')
      setImprovements([])
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    fetchImprovements()
  }, [fetchImprovements])

  return (
    <div className="min-h-[400px] w-full p-6 bg-primary">
      <Card className="flex-1 min-w-[350px] bg-primary-foreground/10 backdrop-blur-md border-primary-foreground/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-primary-foreground/5">
          <CardTitle className="text-sm font-medium text-primary-foreground/90">Areas of Improvement</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20 w-6 h-6 p-1"
                  onClick={fetchImprovements}
                  disabled={isRefreshing}
                  aria-label="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 text-primary-foreground/90 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-primary-foreground/10 backdrop-blur-md border-primary-foreground/20">
                <p className="text-xs text-primary-foreground/90">Updates Automatically Every 24 Hours</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
              {improvements.map((improvement, index) => (
                <li 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-all duration-300 backdrop-blur-sm border border-primary-foreground/10"
                >
                  <TrendingUp className="w-5 h-5 text-primary-foreground/70" />
                  <span className="flex-1 text-sm font-medium text-primary-foreground/90">
                    {improvement}
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
