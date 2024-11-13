import React, { Suspense } from 'react';

// Import existing components
import CalendarComponent from '@/app/calendar/page';
import LeagueComponent from '@/app/league/page';
import PlanComponent from '@/app/plan/page';
import AchievementComponent from '@/app/achievement/page';
import ActivityCirclesComponent from '@/app/activity-circles/page';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="animate-spin h-8 w-8 border-4 border-[#556bc7] border-t-transparent rounded-full" />
    </div>
  );
}

function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-[#f8f9fe] p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar & Streak */}
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="bg-white rounded-[20px] shadow-md overflow-hidden h-[500px]">
              <Suspense fallback={<LoadingSpinner />}>
                <CalendarComponent />
              </Suspense>
            </div>
          </ErrorBoundary>

          {/* League */}
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="bg-white rounded-[20px] shadow-md overflow-hidden h-[500px]">
              <Suspense fallback={<LoadingSpinner />}>
                <LeagueComponent />
              </Suspense>
            </div>
          </ErrorBoundary>

          {/* Daily Plan */}
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="bg-white rounded-[20px] shadow-md overflow-hidden h-[500px]">
              <Suspense fallback={<LoadingSpinner />}>
                <PlanComponent />
              </Suspense>
            </div>
          </ErrorBoundary>
        </div>

        {/* Achievement Showcase */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <div className="bg-white rounded-[20px] shadow-md overflow-hidden">
            <Suspense fallback={<LoadingSpinner />}>
              <AchievementComponent />
            </Suspense>
          </div>
        </ErrorBoundary>

        {/* Activity Circles */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <div className="bg-white rounded-[20px] shadow-md overflow-hidden">
            <Suspense fallback={<LoadingSpinner />}>
              <ActivityCirclesComponent />
            </Suspense>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
