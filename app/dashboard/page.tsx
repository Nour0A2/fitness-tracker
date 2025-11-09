'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl mb-6 animate-bounce">💪</div>
          <div className="text-5xl font-black text-white mb-4 animate-pulse">LOADING...</div>
          <div className="text-2xl font-bold text-white/80">Getting your fitness data ready! 🔥</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 gap-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl flex-1 border-4 border-white/50">
              <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                Hey {user?.user_metadata?.full_name || 'Champion'}! 👋
              </h1>
              <p className="text-gray-700 text-lg font-bold">
                🔥 Let's crush those fitness goals today! 💪
              </p>
            </div>
            <button
              onClick={() => {
                const supabase = createClient()
                supabase.auth.signOut()
                router.push('/')
              }}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-6 rounded-3xl font-black text-lg shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all border-4 border-white/50"
            >
              👋 Logout
            </button>
          </div>

          {/* Stats Cards - SUPER FUN! */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="relative bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border-4 border-orange-300 transform hover:scale-110 hover:-rotate-2 transition-all cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
              <div className="text-7xl mb-4 animate-bounce">🔥</div>
              <h3 className="text-xl font-black text-gray-800 mb-3">
                CURRENT STREAK
              </h3>
              <p className="text-6xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent mb-2">
                {stats.currentStreak}
              </p>
              <p className="text-2xl font-bold text-gray-600">DAYS</p>
              <p className="text-sm font-bold text-orange-600 mt-3 uppercase">
                {stats.currentStreak > 0 ? "🚀 On Fire!" : "⚡ Start Today!"}
              </p>
            </div>

            <div className="relative bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border-4 border-blue-300 transform hover:scale-110 hover:rotate-2 transition-all cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
              <div className="text-7xl mb-4 animate-pulse">👥</div>
              <h3 className="text-xl font-black text-gray-800 mb-3">
                YOUR GROUPS
              </h3>
              <p className="text-6xl font-black bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
                {stats.groupCount}
              </p>
              <p className="text-2xl font-bold text-gray-600">SQUADS</p>
              <p className="text-sm font-bold text-blue-600 mt-3 uppercase">
                {stats.groupCount > 0 ? "🏆 Team Power!" : "➕ Create One!"}
              </p>
            </div>

            <div className="relative bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border-4 border-green-300 transform hover:scale-110 hover:-rotate-2 transition-all cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-teal-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
              <div className="text-7xl mb-4 animate-bounce">📅</div>
              <h3 className="text-xl font-black text-gray-800 mb-3">
                THIS MONTH
              </h3>
              <p className="text-6xl font-black bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                {stats.activeDaysThisMonth}
              </p>
              <p className="text-2xl font-bold text-gray-600">DAYS</p>
              <p className="text-sm font-bold text-green-600 mt-3 uppercase">
                {stats.activeDaysThisMonth > 15 ? "🌟 Crushing It!" : "💪 Keep Going!"}
              </p>
            </div>
          </div>

          {/* Quick Actions - SUPER FUN! */}
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl mb-8 border-4 border-white/50">
            <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              ⚡ QUICK ACTIONS ⚡
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => groups.length > 0 && markTodayActive(groups[0].id)}
                disabled={groups.length === 0}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-black py-8 px-6 rounded-2xl text-left transition-all transform hover:scale-105 hover:-rotate-1 shadow-xl border-4 border-white/50"
              >
                <div className="text-6xl mb-3 animate-bounce">✅</div>
                <div className="text-2xl mb-2">MARK TODAY ACTIVE</div>
                <div className="text-sm font-bold opacity-90">
                  {groups.length > 0 ? '🔥 Log your workout NOW!' : '⚠️ Create a group first'}
                </div>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black py-8 px-6 rounded-2xl text-left transition-all transform hover:scale-105 hover:rotate-1 shadow-xl border-4 border-white/50"
              >
                <div className="text-6xl mb-3 animate-pulse">➕</div>
                <div className="text-2xl mb-2">CREATE NEW GROUP</div>
                <div className="text-sm font-bold opacity-90">🚀 Start competing with friends!</div>
              </button>
            </div>
          </div>

          {/* Groups List - AMAZING! */}
          {groups.length > 0 ? (
            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border-4 border-white/50">
              <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 flex items-center gap-3">
                <span className="text-5xl">🏆</span>
                YOUR SQUADS ({groups.length})
              </h2>
              <div className="space-y-4">
                {groups.map((group, index) => (
                  <div
                    key={group.id}
                    className="relative bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 p-6 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-400 transition-all transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
                    onClick={() => router.push(`/groups/${group.id}`)}
                  >
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <span className="text-xl">💰</span>
                        {group.prize_amount} {group.currency}
                      </div>
                    </div>

                    <div className="mb-4 pr-32">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">
                          {index === 0 ? '🏆' : index === 1 ? '🎯' : index === 2 ? '⚡' : '💪'}
                        </span>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                          {group.name}
                        </h3>
                      </div>
                      {group.description && (
                        <p className="text-gray-600 dark:text-gray-400 ml-12">
                          {group.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => markTodayActive(group.id)}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105 shadow-lg"
                      >
                        ✅ Mark Active Today
                      </button>
                      <button
                        onClick={() => router.push(`/groups/${group.id}`)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105 shadow-lg"
                      >
                        🏆 View Leaderboard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-lg text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Start Your Journey?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Create your first group to start tracking your fitness progress and competing with friends!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Create Your First Group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black transition-opacity"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setShowCreateModal(false)}
          />

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all"
              style={{
                position: 'relative',
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                animation: 'slideIn 0.3s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with emoji */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🎯</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Create New Group
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Start your fitness journey together!
                </p>
              </div>

              <div className="space-y-5 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🏷️ Group Name *
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="e.g., Family Fitness Challenge"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📝 Description
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="What's this group about? Who's competing?"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    💰 Prize Amount (DT per member)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newGroup.prizeAmount}
                      onChange={(e) => setNewGroup({ ...newGroup, prizeAmount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.5"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                    />
                    <span className="absolute right-4 top-3 text-gray-500 dark:text-gray-400 font-semibold">
                      DT
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Winner takes all at the end of the month! 🏆
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createGroup}
                  disabled={creating}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                >
                  {creating ? '⏳ Creating...' : '✨ Create Group'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
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
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

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

