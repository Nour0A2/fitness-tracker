import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Fitness Tracker
          </h1>
          <p className="text-xl text-purple-200 mb-16">
            Track together. Stay consistent.
          </p>

          {/* Animated Feature Bubbles */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Groups Bubble */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:bg-white/15">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl text-white">◉</div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Groups
              </h3>
              <p className="text-purple-200 text-sm">
                Track with friends
              </p>
            </div>

            {/* Streaks Bubble */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:bg-white/15">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl text-white">◐</div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Streaks
              </h3>
              <p className="text-purple-200 text-sm">
                Build consistency
              </p>
            </div>

            {/* Prizes Bubble */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:bg-white/15">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl text-white">◈</div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Prizes
              </h3>
              <p className="text-purple-200 text-sm">
                Win monthly rewards
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105">
              Get Started
            </Link>
            <Link href="/login" className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105">
              Login
            </Link>
          </div>
        </div>
      </div>


    </div>
  );
}

