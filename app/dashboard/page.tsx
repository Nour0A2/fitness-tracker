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
  todaySteps: number
  todayCalories: number
  todayDistance: number
  heartRate: number
}

interface CalendarDay {
  date: Date
  isActive: boolean
  isToday: boolean
  isCurrentMonth: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [stats, setStats] = useState<Stats>({ 
    currentStreak: 0, 
    groupCount: 0, 
    activeDaysThisMonth: 0,
    todaySteps: 2847,
    todayCalories: 245,
    todayDistance: 3.2,
    heartRate: 128
  })
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', description: '', prizeAmount: 5 })
  const [creating, setCreating] = useState(false)
  const [markedToday, setMarkedToday] = useState(false)
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [userName, setUserName] = useState('Guest')

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Generate calendar days for current month
  function generateCalendarDays(activeDates: string[]): CalendarDay[] {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Get first day of month and how many days in month
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()

    // Get first day of week (0 = Sunday, 1 = Monday, etc.)
    const startingDayOfWeek = firstDay.getDay()

    const days: CalendarDay[] = []

    // Add empty days for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(currentYear, currentMonth, -startingDayOfWeek + i + 1)
      days.push({
        date: prevDate,
        isActive: false,
        isToday: false,
        isCurrentMonth: false
      })
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateString = date.toISOString().split('T')[0]
      const isToday = dateString === today.toISOString().split('T')[0]
      const isActive = activeDates.includes(dateString)

      days.push({
        date,
        isActive,
        isToday,
        isCurrentMonth: true
      })
    }

    // Add empty days for next month to complete the grid (42 days = 6 weeks)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i)
      days.push({
        date: nextDate,
        isActive: false,
        isToday: false,
        isCurrentMonth: false
      })
    }

    return days
  }

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

      // Generate calendar with all active dates for current month
      const activeDates = activities?.map(a => a.date) || []
      const calendar = generateCalendarDays(activeDates)
      setCalendarDays(calendar)
    }

    setStats({
      currentStreak: maxStreak,
      groupCount: userGroups.length,
      activeDaysThisMonth: activeDays,
      todaySteps: 2847,
      todayCalories: 245,
      todayDistance: 3.2,
      heartRate: 128
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

      // Initialize streak
      await supabase
        .from('streaks')
        .insert([{
          user_id: user.id,
          group_id: group.id,
          current_streak: 0,
          longest_streak: 0
        }])

      setShowCreateModal(false)
      setNewGroup({ name: '', description: '', prizeAmount: 5 })
      await loadDashboardData()
    } catch (error: any) {
      alert('Error creating group: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <div className="text-gray-600 mt-4">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">FitTrack</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors rounded-lg hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="text-sm text-gray-600 mb-1">Good Morning 👋</div>
          <h1 className="text-4xl font-black text-gray-900 mb-1">
            {userName}
          </h1>
          <p className="text-gray-600">
            {user?.email}
          </p>
        </div>

        {/* Main Stats Card */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm opacity-90 mb-2">Today's Progress</div>
              <div className="text-5xl font-black mb-2">{stats.todaySteps.toLocaleString()}</div>
              <div className="text-sm opacity-90">of 10,000 steps</div>
              
              <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(stats.todaySteps / 10000) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="ml-8">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="56" 
                    stroke="white" 
                    strokeWidth="12" 
                    fill="none" 
                    strokeDasharray="351.86" 
                    strokeDashoffset={351.86 - (351.86 * (stats.todaySteps / 10000))} 
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{Math.round((stats.todaySteps / 10000) * 100)}%</span>
                  <span className="text-xs opacity-90">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="text-4xl mb-3">🔥</div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stats.todayCalories}</div>
            <div className="text-sm text-gray-600">Calories Burned</div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="text-4xl mb-3">❤️</div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stats.heartRate}</div>
            <div className="text-sm text-gray-600">Heart Rate (bpm)</div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="text-4xl mb-3">📍</div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stats.todayDistance}</div>
            <div className="text-sm text-gray-600">Distance (km)</div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="text-4xl mb-3">⏱️</div>
            <div className="text-3xl font-black text-gray-900 mb-1">45</div>
            <div className="text-sm text-gray-600">Minutes Active</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Streak & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Streak Stats */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Streaks</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
                  <div className="text-4xl mb-3">�</div>
                  <div className="text-4xl font-black text-gray-900 mb-1">{stats.currentStreak}</div>
                  <div className="text-sm text-gray-600">Current Streak (days)</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
                  <div className="text-4xl mb-3">📅</div>
                  <div className="text-4xl font-black text-gray-900 mb-1">{stats.activeDaysThisMonth}</div>
                  <div className="text-sm text-gray-600">Active Days This Month</div>
                </div>
              </div>
            </div>

            {/* Calendar */}
            {calendarDays.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Activity Calendar</h2>
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    {showCalendar ? 'Hide' : 'Show'} Calendar
                  </button>
                </div>

                {showCalendar && (
                  <div>
                    <div className="grid grid-cols-7 gap-2 mb-3">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-bold text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((day, index) => (
                        <div
                          key={index}
                          className={`
                            aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all
                            ${!day.isCurrentMonth ? 'text-gray-300 bg-gray-50' : 
                              day.isActive ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg transform scale-105' :
                              day.isToday ? 'bg-purple-100 text-purple-900 ring-2 ring-purple-500' :
                              'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                        >
                          {day.date.getDate()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Groups */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Groups</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {groups.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">No Groups Yet</h3>
                  <p className="text-xs text-gray-600 mb-4">
                    Create your first group
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-sm px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Create Group
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map(group => (
                    <Link
                      key={group.id}
                      href={`/groups/${group.id}`}
                      className="block bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      {group.description && (
                        <p className="text-xs text-gray-600 mb-3">{group.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-purple-100">
                        <div>
                          <div className="text-xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {group.prize_amount} {group.currency}
                          </div>
                          <div className="text-xs text-gray-500">Prize</div>
                        </div>
                        <div className="text-xs text-gray-500">👥 View</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">Create New Group</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g., Family Fitness"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="What's this group about?"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Monthly Prize Amount (DT)
                </label>
                <input
                  type="number"
                  value={newGroup.prizeAmount}
                  onChange={(e) => setNewGroup({ ...newGroup, prizeAmount: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Each member contributes this amount to the monthly prize pool
                </p>
              </div>

              <button
                onClick={createGroup}
                disabled={creating || !newGroup.name.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {creating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
