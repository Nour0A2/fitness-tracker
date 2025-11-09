'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Member {
  id: string
  user_id: string
  joined_at: string
  profiles: {
    full_name: string
    email: string
  }
  streak?: number
  active_days?: number
}

interface Group {
  id: string
  name: string
  description: string
  prize_amount: number
  currency: string
  created_by: string
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadGroupData()
  }, [groupId])

  async function loadGroupData() {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)

    // Get group details
    const { data: groupData } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single()

    if (!groupData) {
      router.push('/dashboard')
      return
    }
    setGroup(groupData)

    // Get members with their stats
    const { data: membersData } = await supabase
      .from('group_members')
      .select(`
        id,
        user_id,
        joined_at,
        profiles (
          full_name,
          email
        )
      `)
      .eq('group_id', groupId)

    // Get streaks for each member
    const membersWithStats = await Promise.all(
      (membersData || []).map(async (member: any) => {
        const { data: streak } = await supabase
          .from('streaks')
          .select('current_streak')
          .eq('user_id', member.user_id)
          .eq('group_id', groupId)
          .single()

        const { data: activities } = await supabase
          .from('activity_logs')
          .select('date')
          .eq('user_id', member.user_id)
          .eq('group_id', groupId)
          .eq('is_active', true)

        return {
          ...member,
          streak: streak?.current_streak || 0,
          active_days: activities?.length || 0
        }
      })
    )

    setMembers(membersWithStats)
    setLoading(false)
  }

  async function inviteMember() {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    setInviting(true)
    const supabase = createClient()

    try {
      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail.toLowerCase())
        .single()

      if (existingProfile) {
        // User exists, add them directly
        const { error } = await supabase
          .from('group_members')
          .insert([{
            group_id: groupId,
            user_id: existingProfile.id
          }])

        if (error) throw error
        alert(`✅ ${inviteEmail} added to the group!`)
      } else {
        // User doesn't exist, create invitation
        const { error } = await supabase
          .from('invitations')
          .insert([{
            group_id: groupId,
            email: inviteEmail.toLowerCase(),
            invited_by: user.id
          }])

        if (error) throw error
        alert(`📧 Invitation sent to ${inviteEmail}!\n\nThey'll receive an email to join the group.`)
      }

      setInviteEmail('')
      setShowInviteModal(false)
      await loadGroupData()
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setInviting(false)
    }
  }

  async function markActive(date: string) {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('activity_logs')
        .upsert([{
          user_id: user.id,
          group_id: groupId,
          date: date,
          is_active: true
        }], {
          onConflict: 'user_id,group_id,date'
        })

      if (error) throw error

      await supabase.rpc('update_user_streak', {
        p_user_id: user.id,
        p_group_id: groupId,
        p_date: date
      })

      await loadGroupData()
      alert('✅ Day marked as active!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl mb-6 animate-spin">🏆</div>
          <div className="text-5xl font-black text-white mb-4 animate-pulse">LOADING...</div>
          <div className="text-2xl font-bold text-white/80">Preparing the leaderboard! 🔥</div>
        </div>
      </div>
    )
  }

  if (!group) return null

  // Sort members by streak (highest first)
  const sortedMembers = [...members].sort((a, b) => (b.streak || 0) - (a.streak || 0))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {group.name} 🏆
                  </h1>
                  {group.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {group.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {group.prize_amount} {group.currency}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Prize Pool
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => markActive(selectedDate)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  ✅ Mark Today Active
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  ➕ Invite Members
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              🏅 Leaderboard
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({members.length} members)
              </span>
            </h2>
            
            <div className="space-y-3">
              {sortedMembers.map((member, index) => (
                <div
                  key={member.id}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-gray-300 dark:border-gray-600'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-300 dark:border-orange-600'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white">
                          {member.profiles?.full_name || 'Unknown'}
                          {member.user_id === user?.id && (
                            <span className="ml-2 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {member.profiles?.email}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            🔥 {member.streak || 0}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Day Streak
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ✅ {member.active_days || 0}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Total Days
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        >
          <div 
            className="fixed inset-0 bg-black transition-opacity"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowInviteModal(false)}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">📧</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Invite Members
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Add friends to compete together!
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📮 Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && inviteMember()}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  💡 They'll get an email invitation to join this group
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={inviteMember}
                  disabled={inviting}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                >
                  {inviting ? '⏳ Sending...' : '✨ Send Invite'}
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  disabled={inviting}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-4 px-6 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

