'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if Supabase is configured by trying to create a client
    try {
      const supabase = createClient()
      // If we can create a client, assume it's configured
      setSupabaseConfigured(true)
    } catch (error) {
      setSupabaseConfigured(false)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // If Supabase is not configured, show demo mode
      if (!supabaseConfigured) {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Show a message and redirect to dashboard
        alert(`Demo Mode: Logging in as ${email}\n\nRedirecting to dashboard...`)
        router.push('/dashboard')
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check for pending invitations and auto-join groups
      if (data.user) {
        console.log('Checking for pending invitations for:', email)
        const { data: invitations, error: inviteError } = await supabase
          .from('invitations')
          .select('group_id')
          .eq('email', email.toLowerCase())
          .is('used_at', null)

        if (inviteError) {
          console.error('Error checking invitations:', inviteError)
        } else if (invitations && invitations.length > 0) {
          console.log('Found pending invitations:', invitations)

          // Join all groups the user was invited to
          for (const invitation of invitations) {
            try {
              // Check if user is already a member
              const { data: existingMember } = await supabase
                .from('group_members')
                .select('id')
                .eq('group_id', invitation.group_id)
                .eq('user_id', data.user.id)
                .single()

              if (!existingMember) {
                const { error: joinError } = await supabase
                  .from('group_members')
                  .insert([{
                    group_id: invitation.group_id,
                    user_id: data.user.id
                  }])

                if (joinError) {
                  console.error('Error joining group:', joinError)
                } else {
                  console.log('Successfully joined group:', invitation.group_id)

                  // Mark invitation as used
                  await supabase
                    .from('invitations')
                    .update({ used_at: new Date().toISOString() })
                    .eq('group_id', invitation.group_id)
                    .eq('email', email.toLowerCase())
                }
              } else {
                // Already a member, just mark invitation as used
                await supabase
                  .from('invitations')
                  .update({ used_at: new Date().toISOString() })
                  .eq('group_id', invitation.group_id)
                  .eq('email', email.toLowerCase())
              }
            } catch (err) {
              console.error('Error processing invitation:', err)
            }
          }
        }
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Branding - Hide on Mobile */}
        <div className="hidden lg:block">
          <Link href="/" className="inline-flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">FitTrack</span>
          </Link>
          
          <h2 className="text-5xl font-black text-gray-900 mb-6">
            Track Your<br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Fitness Goals
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Monitor workouts, build streaks, and achieve your fitness goals with friends.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">Activity Tracking</div>
                <div className="text-sm text-gray-600">Monitor your daily progress</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">Build Streaks</div>
                <div className="text-sm text-gray-600">Stay consistent every day</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">Join Groups</div>
                <div className="text-sm text-gray-600">Compete with friends</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form - Mobile Optimized */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <Link href="/" className="inline-flex items-center space-x-2 mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">FitTrack</span>
              </Link>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 sm:mb-2">
                Welcome Back
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Sign in to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-medium">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder="Enter password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 sm:mt-6 text-center">
              <p className="text-sm sm:text-base text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-bold transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

