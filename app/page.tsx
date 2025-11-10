'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">FitTrack</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-semibold transition-colors rounded-xl">
                Sign In
              </Link>
              <Link href="/signup" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full">
                <span className="text-sm font-bold text-purple-600">🎯 Your Personal Fitness Companion</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black leading-tight">
                <span className="text-gray-900">Track Your</span>
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Fitness Journey
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Monitor workouts, track calories, build streaks, and achieve your fitness goals with our comprehensive tracking system.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/signup" 
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-purple-200 transform hover:scale-105 transition-all flex items-center justify-center"
                >
                  Start Free Trial
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link 
                  href="/login" 
                  className="px-8 py-4 bg-white text-gray-900 text-lg font-bold rounded-2xl border-2 border-gray-200 hover:border-purple-300 transform hover:scale-105 transition-all flex items-center justify-center"
                >
                  Watch Demo
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-4xl font-black text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Workouts</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-gray-900">4.8★</div>
                  <div className="text-sm text-gray-600">App Rating</div>
                </div>
              </div>
            </div>

            {/* Right - App Mockup */}
            <div className="relative">
              <div className="relative mx-auto w-80 h-[640px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 rounded-[2.5rem] overflow-hidden">
                  {/* Mock Dashboard */}
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-gray-600 text-sm">Good Morning</div>
                        <div className="text-xl font-bold text-gray-900">Alex Smith</div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full"></div>
                    </div>

                    {/* Main Stats Card */}
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-sm opacity-90">Today's Progress</div>
                          <div className="text-3xl font-black mt-1">2,847</div>
                          <div className="text-sm opacity-90">of 10,000 steps</div>
                        </div>
                        <div className="relative w-24 h-24">
                          <svg className="transform -rotate-90 w-24 h-24">
                            <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                            <circle cx="48" cy="48" r="40" stroke="white" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="180" strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-black">28%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-2xl p-4 shadow-md">
                        <div className="text-3xl mb-2">🔥</div>
                        <div className="text-2xl font-black text-gray-900">245</div>
                        <div className="text-xs text-gray-600">Calories</div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 shadow-md">
                        <div className="text-3xl mb-2">❤️</div>
                        <div className="text-2xl font-black text-gray-900">128</div>
                        <div className="text-xs text-gray-600">Heart Rate</div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 shadow-md">
                        <div className="text-3xl mb-2">⏱️</div>
                        <div className="text-2xl font-black text-gray-900">45m</div>
                        <div className="text-xs text-gray-600">Duration</div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 shadow-md">
                        <div className="text-3xl mb-2">📍</div>
                        <div className="text-2xl font-black text-gray-900">3.2</div>
                        <div className="text-xs text-gray-600">KM</div>
                      </div>
                    </div>

                    {/* Activity List */}
                    <div className="bg-white rounded-2xl p-4 shadow-md">
                      <div className="text-sm font-bold text-gray-900 mb-3">Recent Activity</div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-sm">🏃</div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-gray-900">Running</div>
                            <div className="text-xs text-gray-500">25 min ago</div>
                          </div>
                          <div className="text-xs font-bold text-purple-600">-120 cal</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">💪</div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-gray-900">Workout</div>
                            <div className="text-xs text-gray-500">1 hr ago</div>
                          </div>
                          <div className="text-xs font-bold text-blue-600">-85 cal</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-purple-100 rounded-full mb-4">
              <span className="text-sm font-bold text-purple-600">FEATURES</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Everything You Need to Stay Fit
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive fitness tracking tools in one powerful app
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Activity Tracking</h3>
              <p className="text-gray-600">Monitor steps, calories, distance, and active minutes</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl">❤️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Heart Rate</h3>
              <p className="text-gray-600">Track your heart rate zones during workouts</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Goal Setting</h3>
              <p className="text-gray-600">Set and achieve personalized fitness goals</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-100 rounded-3xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Social Groups</h3>
              <p className="text-gray-600">Join groups and compete with friends</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8 text-center text-white">
          <div className="transform hover:scale-110 transition-transform">
            <div className="text-6xl font-black mb-2">10K+</div>
            <div className="text-purple-100 text-lg">Active Users</div>
          </div>
          <div className="transform hover:scale-110 transition-transform">
            <div className="text-6xl font-black mb-2">50K+</div>
            <div className="text-purple-100 text-lg">Workouts Logged</div>
          </div>
          <div className="transform hover:scale-110 transition-transform">
            <div className="text-6xl font-black mb-2">98%</div>
            <div className="text-purple-100 text-lg">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-black">FitTrack</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 FitTrack. Built with 💪 for fitness enthusiasts.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
