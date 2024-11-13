export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="space-y-4 text-2xl">
        <div>
          <a href="/vision-board" className="text-blue-500 hover:text-blue-600">
            Go to Vision Board
          </a>
        </div>
        <div>
          <a href="/analytics" className="text-blue-500 hover:text-blue-600">
            Go to Analytics Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
