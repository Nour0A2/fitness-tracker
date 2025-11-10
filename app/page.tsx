'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">FitTrack</span>
            </div>
            <Link 
              href="/login" 
              className="px-5 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6">
            Get Fit Together
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Track workouts, build streaks, compete with friends
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Start Free
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 text-lg font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transform hover:scale-105 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl mx-auto">
                <span className="text-4xl">👥</span>
              </div>
              <p className="text-sm font-semibold text-gray-600">Groups</p>
            </div>
            <div className="group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl mx-auto">
                <span className="text-4xl">🔥</span>
              </div>
              <p className="text-sm font-semibold text-gray-600">Streaks</p>
            </div>
            <div className="group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl mx-auto">
                <span className="text-4xl">🏆</span>
              </div>
              <p className="text-sm font-semibold text-gray-600">Win</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8 text-center text-white">
          <div className="transform hover:scale-110 transition-transform">
            <div className="text-5xl font-black mb-1">1K+</div>
            <div className="text-orange-100">Members</div>
          </div>
          <div className="transform hover:scale-110 transition-transform">
            <div className="text-5xl font-black mb-1">50K+</div>
            <div className="text-orange-100">Workouts</div>
          </div>
          <div className="transform hover:scale-110 transition-transform">
            <div className="text-5xl font-black mb-1">200+</div>
            <div className="text-orange-100">Groups</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 text-center text-gray-600 text-sm">
        © 2025 FitTrack
      </footer>
    </div>
  )
}
