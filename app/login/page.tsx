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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Login
          </h1>
          <p className="text-purple-200">
            Continue to your account
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-all"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-200">
              Don't have an account?{' '}
              <Link href="/signup" className="text-white hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-purple-200 hover:text-white">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

