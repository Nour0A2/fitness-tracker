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
  const [markedToday, setMarkedToday] = useState(false)

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
        alert(`${inviteEmail} added to the group`)
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
        alert(`Invitation sent to ${inviteEmail}`)
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
      alert('Day marked as active')
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-purple-200">Loading...</div>
      </div>
    )
  }

  if (!group) return null

  // Sort members by streak (highest first)
  const sortedMembers = [...members].sort((a, b) => (b.streak || 0) - (a.streak || 0))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {/* Glassmorphism overlay effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-12 pb-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="text-purple-200 text-sm hover:text-white mb-3 inline-block">
            ← Back
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {group.name}
              </h1>
              {group.description && (
                <p className="text-sm text-purple-200 mt-1">
                  {group.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-yellow-300">
                {group.prize_amount} {group.currency}
              </div>
              <div className="text-xs text-purple-200">
                Prize
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-24">

        {/* Mark Today Button */}
        {!markedToday ? (
          <button
            onClick={async () => {
              await markActive(new Date().toISOString().split('T')[0])
              setMarkedToday(true)
            }}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl mb-4 shadow-lg transition-all"
          >
            ✓ Mark Today as Active
          </button>
        ) : (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-2xl mb-4 text-sm">
            ✓ Great! You've logged today's activity
          </div>
        )}

        <button
          onClick={() => setShowInviteModal(true)}
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-medium py-3 rounded-2xl mb-6 transition-colors text-sm"
        >
          + Invite Member
        </button>

        {/* Leaderboard - Glassmorphism */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-white/20">
          <h2 className="text-lg font-semibold text-white mb-4">
            🏆 Leaderboard
          </h2>

          <div className="space-y-2">
            {sortedMembers.map((member, index) => (
              <div
                key={member.id}
                className={`p-3 rounded-xl ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {member.profiles?.full_name || 'Unknown'}
                        {member.user_id === user?.id && (
                          <span className="ml-2 text-xs bg-purple-500/50 text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-purple-200">
                        {member.active_days || 0} days active
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-orange-300">
                      🔥 {member.streak || 0}
                    </div>
                    <div className="text-xs text-purple-200">
                      streak
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-md w-full p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Invite Member
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && inviteMember()}
            />
            <p className="text-xs text-purple-200 mt-1">
              They'll receive an invitation to join this group
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowInviteModal(false)}
              disabled={inviting}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={inviteMember}
              disabled={inviting || !inviteEmail.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
            >
              {inviting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </div>
        </div>
      )}

      {/* CSS Animations */}
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

