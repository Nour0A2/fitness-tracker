'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">FitTrack</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/login" className="px-3 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base text-gray-700 hover:text-gray-900 font-semibold transition-colors rounded-lg sm:rounded-xl">
                Sign In
              </Link>
              <Link href="/signup" className="px-3 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                Start
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-4 sm:mb-6">
            <span className="text-gray-900">Get Fit</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Together
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
            Track workouts, build streaks, compete with friends
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 max-w-md mx-auto sm:max-w-none">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-base sm:text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transform active:scale-95 transition-all flex items-center justify-center"
            >
              Start Free
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 text-base sm:text-lg font-bold rounded-2xl border-2 border-gray-200 hover:border-purple-300 transform active:scale-95 transition-all flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>

          {/* Stats - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-12 sm:pt-16 max-w-2xl mx-auto">

        
          </div>
        </div>
      </section>

      {/* Features - Mobile First */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 mx-auto shadow-lg">
                <span className="text-2xl sm:text-3xl">📊</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">Activity</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Track daily</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 mx-auto shadow-lg">
                <span className="text-2xl sm:text-3xl">🔥</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">Streaks</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Stay consistent</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 mx-auto shadow-lg">
                <span className="text-2xl sm:text-3xl">🎯</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">Goals</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Achieve more</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 mx-auto shadow-lg">
                <span className="text-2xl sm:text-3xl">👥</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">Groups</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Compete</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bar - Mobile */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4">
            Ready to Start?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-purple-100 mb-6 sm:mb-8">
            Join thousands achieving their goals
          </p>
  
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-black">FitTrack</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2025 FitTrack
          </div>
        </div>
      </footer>
    </div>
  )
}
