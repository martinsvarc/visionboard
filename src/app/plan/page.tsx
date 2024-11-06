"use client"
import * as React from "react"
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ErrorBoundary } from "react-error-boundary"
import { Checkbox } from "@/components/ui/checkbox"

const improvementTasks = [
  "Complete these 3 price negotiation scenarios by Friday",
  "Practice with AI bot on product X for 20 minutes daily",
  "Role-play these specific customer personas"
]

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div role="alert" className="text-red-500 p-4">
      <p>Something went wrong:</p>
      <pre className="text-sm">{error.message}</pre>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  )
}

function ImprovementTask({ task }: { task: string }) {
  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 shadow-[inset_0_0_1px_rgba(255,255,255,0.2)]"
    >
      <Checkbox className="bg-white/10 border-white/20 data-[state=checked]:bg-white/20 data-[state=checked]:text-white" />
      <div className="flex-1 text-sm font-medium text-white/90">
        {task}
      </div>
    </div>
  )
}

const MemoizedImprovementTask = React.memo(ImprovementTask)

function PlanComponent() {
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="min-h-[500px] w-full p-8 bg-blue-600">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Card className="flex-1 min-w-[350px] backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-white/20 bg-white/5">
            <div>
              <CardTitle className="text-sm font-medium text-white/90 mt-1">Daily Personalized Improvement Plan</CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-white/10 hover:bg-white/20 border-white/20 w-6 h-6 p-1 -mt-1"
                      onClick={handleRefresh}
                      aria-label="Refresh improvement plan"
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`w-4 h-4 text-white/90 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  sideOffset={5}
                  className="backdrop-blur-xl bg-white/10 border-white/20 text-white/90"
                >
                  <p className="text-xs">Updates Automatically Every 24 Hours</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              {improvementTasks.map((task, index) => (
                <MemoizedImprovementTask key={index} task={task} />
              ))}
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>
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
