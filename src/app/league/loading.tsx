export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-white p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-[#f2f3f9] rounded-[32px] p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-16 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-[200px] bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
