export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import LeaderboardComponent from './leaderboard-component'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <LeaderboardComponent />
    </Suspense>
  )
}
