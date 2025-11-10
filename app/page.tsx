'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-300 to-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur group-hover:blur-lg opacity-75 transition-all"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">FitTrack</span>
            </div>
            <Link 
              href="/login" 
              className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-semibold transition-colors rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-transform"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-7xl md:text-8xl font-black leading-tight mb-8">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Get Fit</span>
            <br />
            <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent animate-gradient">Together</span>
          </h1>
          
          <p className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Track, compete, stay consistent
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/signup" 
              className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 animate-gradient"></div>
              <span className="relative flex items-center">
                Start Free
                <svg className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-gray-300 transform hover:scale-105 transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Simple Feature Icons */}
          <div className="flex items-center justify-center gap-12">
            <div className="group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl">
                <span className="text-4xl">👥</span>
              </div>
              <p className="text-sm font-semibold text-gray-600">Groups</p>
            </div>
            <div className="group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl">
                <span className="text-4xl">🔥</span>
              </div>
              <p className="text-sm font-semibold text-gray-600">Streaks</p>
            </div>
            <div className="group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl">
                <span className="text-4xl">🏆</span>
              </div>
              <p className="text-sm font-semibold text-gray-600">Win</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
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
  );
}

  const features = [
    {
      icon: '👥',
      title: 'Create Groups',
      description: 'Form fitness squads with friends, family, or workout buddies',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: '🔥',
      title: 'Build Streaks',
      description: 'Track your consistency and watch your streak grow every day',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: '🏆',
      title: 'Win Prizes',
      description: 'Compete monthly and earn rewards for your dedication',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-300 to-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur group-hover:blur-lg opacity-75 transition-all"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">FitTrack</span>
            </div>
            <Link 
              href="/login" 
              className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-semibold transition-colors rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-transform"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-full">
                <span className="text-2xl">🎉</span>
                <span className="text-sm font-semibold text-orange-700">Join 1000+ active members</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Get Fit</span>
                <br />
                <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent animate-gradient">Together</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Track your fitness journey with friends. Build unbreakable streaks, compete on leaderboards, and celebrate victories together 🏆
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/signup" 
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 animate-gradient"></div>
                  <span className="relative flex items-center">
                    Start Free
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-gray-300 transform hover:scale-105 transition-all"
                >
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-8">
                <div>
                  <div className="text-3xl font-black text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Workouts Logged</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-gray-900">200+</div>
                  <div className="text-sm text-gray-600">Active Groups</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-600">User Rating</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative lg:block hidden">
              {/* Phone Mockup */}
              <div className="relative mx-auto w-80 h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-gradient-to-br from-orange-50 to-red-50 rounded-[2.5rem] overflow-hidden">
                  {/* Mock App Content */}
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className="font-bold text-gray-900">FitTrack</span>
                      </div>
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-2xl p-4 shadow-lg">
                        <div className="text-3xl mb-1">🔥</div>
                        <div className="text-2xl font-black text-gray-900">15</div>
                        <div className="text-xs text-gray-600">Day Streak</div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 shadow-lg">
                        <div className="text-3xl mb-1">📅</div>
                        <div className="text-2xl font-black text-gray-900">28</div>
                        <div className="text-xs text-gray-600">Active Days</div>
                      </div>
                    </div>

                    {/* Progress Ring */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32">
                          <svg className="transform -rotate-90 w-32 h-32">
                            <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                            <circle cx="64" cy="64" r="56" stroke="url(#gradient)" strokeWidth="12" fill="none" strokeDasharray="351.86" strokeDashoffset="88" strokeLinecap="round" />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f97316" />
                                <stop offset="100%" stopColor="#ef4444" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-gray-900">75%</span>
                            <span className="text-xs text-gray-600">Complete</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 -left-10 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl animate-float"></div>
              <div className="absolute bottom-20 -right-10 w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full shadow-2xl animate-float animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-4">
              <span className="text-sm font-bold text-orange-700">FEATURES</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to keep you motivated and consistent
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
                  activeFeature === index ? 'ring-4 ring-orange-500 ring-offset-4' : ''
                }`}
                onClick={() => setActiveFeature(index)}
                onMouseEnter={() => setActiveFeature(index)}
              >
                {/* Icon */}
                <div className={`w-20 h-20 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  <span className="text-5xl">{feature.icon}</span>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${feature.color} rounded-full transition-all duration-1000`}
                    style={{ width: activeFeature === index ? '100%' : '0%' }}
                  ></div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-orange-200 via-red-200 to-pink-200"></div>

            {[
              { num: '01', title: 'Create Account', desc: 'Sign up in seconds', icon: '✨' },
              { num: '02', title: 'Join Groups', desc: 'Connect with friends', icon: '👥' },
              { num: '03', title: 'Start Tracking', desc: 'Build your streak', icon: '🚀' }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-orange-500 transition-all transform hover:scale-105 hover:shadow-2xl">
                  <div className="relative z-10 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg mx-auto">
                      {step.icon}
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-black shadow-lg">
                      {step.num}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-24 px-6 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-6">
              Loved by Thousands
            </h2>
            <p className="text-xl text-orange-100">
              Join the community making fitness fun
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-6xl font-black mb-2">1000+</div>
              <div className="text-orange-100 text-lg">Active Members</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-6xl font-black mb-2">50K+</div>
              <div className="text-orange-100 text-lg">Workouts Tracked</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-6xl font-black mb-2">200+</div>
              <div className="text-orange-100 text-lg">Groups Created</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-red-50"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
            Ready to Start<br />
            Your Journey?
          </h2>
          <p className="text-2xl text-gray-600 mb-12">
            Join thousands crushing their fitness goals
          </p>
          <Link 
            href="/signup" 
            className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-black text-white rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 animate-gradient"></div>
            <span className="relative flex items-center">
              Get Started Free
              <svg className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          <p className="mt-6 text-gray-500">
            No credit card required • Free forever
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-black text-gray-900">FitTrack</span>
            </div>
            <div className="text-gray-600 text-sm">
              © 2025 FitTrack. Built with 💪 for fitness enthusiasts.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
