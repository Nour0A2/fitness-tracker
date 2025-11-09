'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
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
      // If we can create a client, check if the URL looks valid
      const url = typeof window !== 'undefined' ? window.location.origin : ''
      // Assume it's configured if we got here
      setSupabaseConfigured(true)
    } catch (error) {
      setSupabaseConfigured(false)
    }
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // If Supabase is not configured, show demo mode
      if (!supabaseConfigured) {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Show a message and redirect to dashboard
        alert(`Demo Mode: Account would be created for ${email}\n\nRedirecting to dashboard...`)
        router.push('/dashboard')
        return
      }

      const supabase = createClient()

      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        console.error('Signup error:', signUpError)
        throw signUpError
      }

      console.log('Signup data:', data)

      // Create profile
      if (data.user) {
        console.log('Creating profile for user:', data.user.id)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              full_name: email.split('@')[0], // Use email username as display name
            },
          ])

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't throw - profile might already exist
        } else {
          console.log('Profile created successfully!')
        }
      }

      // Check if email confirmation is required
      if (data.session) {
        // User is logged in immediately
        router.push('/dashboard')
        router.refresh()
      } else {
        // Email confirmation required
        setError('Please check your email to confirm your account!')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Sign Up
          </h1>
          <p className="text-purple-200">
            Create your account
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSignup} className="space-y-5">
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
                minLength={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="mt-1 text-sm text-purple-200">
                At least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-all"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-200">
              Already have an account?{' '}
              <Link href="/login" className="text-white hover:underline font-semibold">
                Login
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

