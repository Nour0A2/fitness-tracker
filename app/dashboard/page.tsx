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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">💪</div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {user?.user_metadata?.full_name || 'My Dashboard'}
            </h1>
            <p className="text-sm text-gray-500">
              {stats.currentStreak > 0 ? `🔥 ${stats.currentStreak} day streak` : 'Start your streak today'}
            </p>
          </div>
          <button
            onClick={() => {
              const supabase = createClient()
              supabase.auth.signOut()
              router.push('/')
            }}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Quick Stats - Simple */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.currentStreak}</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeDaysThisMonth}</div>
              <div className="text-xs text-gray-500">This Month</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.groupCount}</div>
              <div className="text-xs text-gray-500">Groups</div>
            </div>
          </div>
        </div>

        {/* Mark Today Button - Prominent */}
        {!markedToday && groups.length > 0 && (
          <button
            onClick={async () => {
              await markTodayActive(groups[0].id)
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

        {/* Groups List - Clean & Simple */}
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              My Groups
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              + New Group
            </button>
          </div>

          {groups.length > 0 ? (
            <div className="space-y-2">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-indigo-600">
                        {group.prize_amount} {group.currency}
                      </div>
                      <div className="text-xs text-gray-500">prize</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{group.member_count || 0} members</span>
                    <span className="text-indigo-600">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <div className="text-4xl mb-3">💪</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                No groups yet
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Create a group to start tracking with friends
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors"
              >
                Create Group
              </button>
            </div>
          )}
        </div>

        {/* Create Group Modal - Simple */}
        {showCreateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create New Group
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="e.g., Family Fitness"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="What's this group about?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prize Amount (DT)
              </label>
              <input
                type="number"
                value={newGroup.prizeAmount}
                onChange={(e) => setNewGroup({ ...newGroup, prizeAmount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Each member contributes this amount
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(false)}
              disabled={creating}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createGroup}
              disabled={creating || !newGroup.name.trim()}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    )}
      </div>
    </div>
  )
}

