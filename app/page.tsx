import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            🏋️ Fitness Tracker
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12">
            Stay consistent. Compete with friends. Win prizes! 🏆
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Create Groups
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Family, friends, or workout buddies - track together!
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Build Streaks
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Mark your active days and watch your streak grow!
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Win Prizes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Most consistent wins the monthly prize pool!
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors text-center">
              Get Started
            </Link>
            <Link href="/login" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-8 rounded-lg text-lg border-2 border-gray-300 dark:border-gray-600 transition-colors text-center">
              Login
            </Link>
          </div>

          {/* How it works */}
          <div className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-left">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
              How It Works
            </h2>
            <ol className="space-y-4 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-3">1.</span>
                <span>Create or join a group with your friends/family</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-3">2.</span>
                <span>Each member contributes 5DT to the monthly prize pool</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-3">3.</span>
                <span>Mark your active workout days throughout the week</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-3">4.</span>
                <span>Build your streak and climb the leaderboard</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-3">5.</span>
                <span>At month's end, the most consistent member wins the prize pool! 🎉</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

