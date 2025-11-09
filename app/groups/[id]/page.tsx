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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!group) return null

  // Sort members by streak (highest first)
  const sortedMembers = [...members].sort((a, b) => (b.streak || 0) - (a.streak || 0))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-indigo-600 text-sm hover:text-indigo-700 mb-2 inline-block">
            ← Back
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {group.name}
              </h1>
              {group.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {group.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-indigo-600">
                {group.prize_amount} {group.currency}
              </div>
              <div className="text-xs text-gray-500">
                Prize
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Mark Today Button */}
        {!markedToday && (
          <button
            onClick={async () => {
              await markActive(new Date().toISOString().split('T')[0])
              setMarkedToday(true)
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 rounded-lg mb-4 shadow-sm transition-colors"
          >
            ✓ Mark Today as Active
          </button>
        )}

        {markedToday && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 text-sm">
            ✓ Great! You've logged today's activity
          </div>
        )}

          <button
            onClick={() => setShowInviteModal(true)}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-lg mb-6 shadow-sm transition-colors text-sm"
          >
            + Invite Member
          </button>
        </div>

        {/* Leaderboard - Simple */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Leaderboard
          </h2>

          <div className="space-y-2">
            {sortedMembers.map((member, index) => (
              <div
                key={member.id}
                className={`p-3 rounded-lg ${
                  index === 0
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-gray-500">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.profiles?.full_name || 'Unknown'}
                        {member.user_id === user?.id && (
                          <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.active_days || 0} days active
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-orange-600">
                      {member.streak || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      streak
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite Modal - Simple */}
        {showInviteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Invite Member
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && inviteMember()}
            />
            <p className="text-xs text-gray-500 mt-1">
              They'll receive an invitation to join this group
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowInviteModal(false)}
              disabled={inviting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={inviteMember}
              disabled={inviting || !inviteEmail.trim()}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
            >
              {inviting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}

