'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Group {
  id: string
  name: string
  description: string
  prize_amount: number
  currency: string
  created_at: string
  member_count?: number
}

interface Stats {
  currentStreak: number
  groupCount: number
  activeDaysThisMonth: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [stats, setStats] = useState<Stats>({ currentStreak: 0, groupCount: 0, activeDaysThisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', description: '', prizeAmount: 5 })
  const [creating, setCreating] = useState(false)
  const [markedToday, setMarkedToday] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)

    // Get user's groups
    const { data: groupMemberships } = await supabase
      .from('group_members')
      .select('group_id, groups(*)')
      .eq('user_id', user.id)

    const userGroups = groupMemberships?.map((gm: any) => gm.groups) || []
    setGroups(userGroups)

    // Get stats
    let maxStreak = 0
    let activeDays = 0

    if (userGroups.length > 0) {
      // Get streaks
      const { data: streaks } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', user.id)

      maxStreak = Math.max(...(streaks?.map(s => s.current_streak) || [0]))

      // Get active days this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: activities } = await supabase
        .from('activity_logs')
        .select('date')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gte('date', startOfMonth.toISOString().split('T')[0])

      activeDays = activities?.length || 0
    }

    setStats({
      currentStreak: maxStreak,
      groupCount: userGroups.length,
      activeDaysThisMonth: activeDays
    })

    setLoading(false)
  }

  async function createGroup() {
    if (!newGroup.name.trim()) {
      alert('Please enter a group name')
      return
    }

    setCreating(true)
    const supabase = createClient()

    try {
      // Create group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert([{
          name: newGroup.name,
          description: newGroup.description,
          prize_amount: newGroup.prizeAmount,
          currency: 'DT',
          created_by: user.id
        }])
        .select()
        .single()

      if (groupError) throw groupError

      // Add creator as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: group.id,
          user_id: user.id
        }])

      if (memberError) throw memberError

      // Reload data
      await loadDashboardData()
      setShowCreateModal(false)
      setNewGroup({ name: '', description: '', prizeAmount: 5 })
    } catch (error: any) {
      alert('Error creating group: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  async function markTodayActive(groupId: string) {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    try {
      // Insert or update activity log
      const { error } = await supabase
        .from('activity_logs')
        .upsert([{
          user_id: user.id,
          group_id: groupId,
          date: today,
          is_active: true
        }], {
          onConflict: 'user_id,group_id,date'
        })

      if (error) throw error

      // Update streak
      await supabase.rpc('update_user_streak', {
        p_user_id: user.id,
        p_group_id: groupId,
        p_date: today
      })

      // Reload data
      await loadDashboardData()
      alert('✅ Day marked as active!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">💪</div>
          <div className="text-purple-200">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {/* Glassmorphism overlay effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-12 pb-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {user?.user_metadata?.full_name || 'Dashboard'}
            </h1>
            <p className="text-purple-200 text-sm mt-1">
              {stats.currentStreak > 0 ? `🔥 ${stats.currentStreak} day streak` : 'Start your journey'}
            </p>
          </div>
          <button
            onClick={() => {
              const supabase = createClient()
              supabase.auth.signOut()
              router.push('/')
            }}
            className="text-white/80 hover:text-white text-sm bg-white/10 backdrop-blur-md px-4 py-2 rounded-full"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-24">

        {/* Colorful Stats Cards - Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Streak Card - Orange/Red Gradient */}
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 shadow-lg">
            <div className="text-white/80 text-xs font-medium mb-1">🔥 Streak</div>
            <div className="text-white text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-white/70 text-xs mt-1">days</div>
          </div>

          {/* This Month Card - Blue/Purple Gradient */}
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-4 shadow-lg">
            <div className="text-white/80 text-xs font-medium mb-1">📅 This Month</div>
            <div className="text-white text-3xl font-bold">{stats.activeDaysThisMonth}</div>
            <div className="text-white/70 text-xs mt-1">active days</div>
          </div>

          {/* Groups Card - Green/Teal Gradient */}
          <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl p-4 shadow-lg">
            <div className="text-white/80 text-xs font-medium mb-1">👥 Groups</div>
            <div className="text-white text-3xl font-bold">{stats.groupCount}</div>
            <div className="text-white/70 text-xs mt-1">joined</div>
          </div>

          {/* Mark Today Card - Pink/Purple Gradient */}
          {!markedToday && groups.length > 0 ? (
            <button
              onClick={async () => {
                await markTodayActive(groups[0].id)
                setMarkedToday(true)
              }}
              className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl p-4 shadow-lg text-left hover:scale-105 transition-transform"
            >
              <div className="text-white/80 text-xs font-medium mb-1">✓ Today</div>
              <div className="text-white text-lg font-bold">Mark Active</div>
              <div className="text-white/70 text-xs mt-1">tap to log</div>
            </button>
          ) : (
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl p-4 shadow-lg">
              <div className="text-white/80 text-xs font-medium mb-1">✓ Today</div>
              <div className="text-white text-lg font-bold">Logged!</div>
              <div className="text-white/70 text-xs mt-1">great job</div>
            </div>
          )}
        </div>

        {/* Groups List - Glassmorphism */}
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-white">
              My Groups
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
            >
              + New
            </button>
          </div>

          {groups.length > 0 ? (
            <div className="space-y-3">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="block bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-purple-200 mt-1">{group.description}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-bold text-yellow-300">
                        {group.prize_amount} {group.currency}
                      </div>
                      <div className="text-xs text-purple-200">prize</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-purple-200">
                    <span>👥 {group.member_count || 0} members</span>
                    <span className="text-white">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
              <div className="text-4xl mb-3">💪</div>
              <h3 className="font-semibold text-white mb-2">
                No groups yet
              </h3>
              <p className="text-sm text-purple-200 mb-4">
                Create a group to start tracking with friends
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-medium py-2 px-6 rounded-full text-sm transition-colors"
              >
                Create Group
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 z-20">
          <div className="max-w-2xl mx-auto px-4 py-3 flex justify-around items-center">
            <button className="flex flex-col items-center gap-1 text-white">
              <div className="text-xl">🏠</div>
              <div className="text-xs font-medium">Home</div>
            </button>
            <button className="flex flex-col items-center gap-1 text-white/50">
              <div className="text-xl">📊</div>
              <div className="text-xs">Stats</div>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex flex-col items-center gap-1 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full -mt-6"
            >
              <div className="text-2xl">➕</div>
            </button>
            <button className="flex flex-col items-center gap-1 text-white/50">
              <div className="text-xl">👥</div>
              <div className="text-xs">Groups</div>
            </button>
            <button className="flex flex-col items-center gap-1 text-white/50">
              <div className="text-xl">⚙️</div>
              <div className="text-xs">Settings</div>
            </button>
          </div>
        </div>

        {/* Create Group Modal */}
        {showCreateModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-md w-full p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Create New Group 🎯
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="e.g., Family Fitness"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Description (optional)
              </label>
              <textarea
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="What's this group about?"
                rows={2}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Prize Amount (DT)
              </label>
              <input
                type="number"
                value={newGroup.prizeAmount}
                onChange={(e) => setNewGroup({ ...newGroup, prizeAmount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
              <p className="text-xs text-purple-200 mt-1">
                Each member contributes this amount
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(false)}
              disabled={creating}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createGroup}
              disabled={creating || !newGroup.name.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    )}
      </div>

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

