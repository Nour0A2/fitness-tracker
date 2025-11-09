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

interface CalendarDay {
  date: Date
  activities: ActivityLog[]
  isToday: boolean
  isCurrentMonth: boolean
}

interface ActivityLog {
  id: string
  date: string
  activity_type: string
  is_active: boolean
}

type ActivityType = 'run' | 'walk' | 'gym' | 'hike' | 'bike'

const ACTIVITY_TYPES: { type: ActivityType; label: string; emoji: string; color: string }[] = [
  { type: 'run', label: 'Run', emoji: '🏃', color: 'from-red-400 to-red-600' },
  { type: 'walk', label: 'Walk', emoji: '🚶', color: 'from-blue-400 to-blue-600' },
  { type: 'gym', label: 'Gym', emoji: '💪', color: 'from-purple-400 to-purple-600' },
  { type: 'hike', label: 'Hike', emoji: '🥾', color: 'from-green-400 to-green-600' },
  { type: 'bike', label: 'Bike', emoji: '🚴', color: 'from-yellow-400 to-yellow-600' },
]

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
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType>('run')

  useEffect(() => {
    loadGroupData()
  }, [groupId])

  // Generate calendar days for current month
  function generateCalendarDays(activities: ActivityLog[]): CalendarDay[] {
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
        activities: [],
        isToday: false,
        isCurrentMonth: false
      })
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateString = date.toISOString().split('T')[0]
      const isToday = dateString === today.toISOString().split('T')[0]
      const dayActivities = activities.filter(a => a.date === dateString)

      days.push({
        date,
        activities: dayActivities,
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
        activities: [],
        isToday: false,
        isCurrentMonth: false
      })
    }

    return days
  }

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
    const { data: membersData, error: membersError } = await supabase
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

    console.log('Members query result:', { membersData, membersError })

    // If profiles join fails, try a simpler approach
    let finalMembersData = membersData
    if (!membersData || membersData.length === 0 || membersError) {
      console.log('Trying simpler members query...')
      const { data: simpleMembersData, error: simpleError } = await supabase
        .from('group_members')
        .select('id, user_id, joined_at')
        .eq('group_id', groupId)

      console.log('Simple members query:', { simpleMembersData, simpleError })

      if (simpleMembersData) {
        // Get profiles separately
        const membersWithProfiles = await Promise.all(
          simpleMembersData.map(async (member: any) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', member.user_id)
              .single()

            return {
              ...member,
              profiles: profile || { full_name: 'Unknown', email: 'unknown@email.com' }
            }
          })
        )
        finalMembersData = membersWithProfiles
      }
    }

    // Get streaks for each member
    const membersWithStats = await Promise.all(
      (finalMembersData || []).map(async (member: any) => {
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

    // Load calendar activities for current user
    if (user) {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: userActivities } = await supabase
        .from('activity_logs')
        .select('id, date, activity_type, is_active')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .gte('date', startOfMonth.toISOString().split('T')[0])

      const activities = userActivities || []
      const calendar = generateCalendarDays(activities)
      setCalendarDays(calendar)

      // Check if today is marked
      const today = new Date().toISOString().split('T')[0]
      const todayActivity = activities.find(a => a.date === today && a.is_active)
      setMarkedToday(!!todayActivity)
    }

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

  async function markActive(date: string, activityType: ActivityType = 'run') {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('activity_logs')
        .upsert([{
          user_id: user.id,
          group_id: groupId,
          date: date,
          is_active: true,
          activity_type: activityType
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

      const activityInfo = ACTIVITY_TYPES.find(a => a.type === activityType)
      alert(`${activityInfo?.emoji} ${activityInfo?.label} activity logged for ${date}!`)
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  function handleDayClick(day: CalendarDay) {
    if (!day.isCurrentMonth) return

    setSelectedDay(day.date)
    setShowActivityModal(true)
  }

  async function logActivity() {
    if (!selectedDay) return

    const dateString = selectedDay.toISOString().split('T')[0]
    await markActive(dateString, selectedActivityType)

    setShowActivityModal(false)
    setSelectedDay(null)
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

        {/* Calendar Toggle Button */}
        <div className="mt-6">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white hover:bg-white/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📅</div>
                <div>
                  <div className="font-semibold text-left">Activity Calendar</div>
                  <div className="text-sm text-purple-200 text-left">Track your daily activities</div>
                </div>
              </div>
              <div className="text-xl">
                {showCalendar ? '▼' : '▶'}
              </div>
            </div>
          </button>
        </div>

        {/* Calendar View */}
        {showCalendar && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mt-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
            </div>

            {/* Calendar Header - Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-purple-200 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={!day.isCurrentMonth}
                  className={`
                    aspect-square flex flex-col items-center justify-center text-xs rounded-lg transition-all relative
                    ${day.isCurrentMonth
                      ? day.activities.length > 0
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold shadow-lg hover:scale-105'
                        : day.isToday
                          ? 'bg-white/20 text-white font-semibold border-2 border-white/40 hover:bg-white/30'
                          : 'text-white hover:bg-white/10 border border-white/10'
                      : 'text-purple-300/30 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="text-sm">{day.date.getDate()}</div>
                  {day.activities.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {day.activities.slice(0, 3).map((activity, i) => {
                        const activityType = ACTIVITY_TYPES.find(a => a.type === activity.activity_type)
                        return (
                          <div key={i} className="text-xs opacity-90">
                            {activityType?.emoji || '✓'}
                          </div>
                        )
                      })}
                      {day.activities.length > 3 && (
                        <div className="text-xs opacity-70">+{day.activities.length - 3}</div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Calendar Legend */}
            <div className="mt-4">
              <div className="text-xs text-purple-200 mb-2 text-center">Activity Types:</div>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                {ACTIVITY_TYPES.map(activity => (
                  <div key={activity.type} className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                    <span>{activity.emoji}</span>
                    <span className="text-purple-200">{activity.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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

      {/* Activity Selection Modal */}
      {showActivityModal && selectedDay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">
              Log Activity
            </h2>
            <p className="text-purple-200 text-center mb-6">
              {selectedDay.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>

            {/* Activity Type Selection */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium text-purple-200">
                Choose Activity Type:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ACTIVITY_TYPES.map((activity) => (
                  <button
                    key={activity.type}
                    onClick={() => setSelectedActivityType(activity.type)}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-center
                      ${selectedActivityType === activity.type
                        ? 'border-white bg-white/20 text-white'
                        : 'border-white/20 bg-white/5 text-purple-200 hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{activity.emoji}</div>
                    <div className="text-sm font-medium">{activity.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowActivityModal(false)
                  setSelectedDay(null)
                }}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={logActivity}
                className={`
                  flex-1 px-4 py-3 rounded-xl font-medium transition-all text-white
                  bg-gradient-to-r ${ACTIVITY_TYPES.find(a => a.type === selectedActivityType)?.color || 'from-purple-500 to-purple-600'}
                  hover:scale-105 shadow-lg
                `}
              >
                Log {ACTIVITY_TYPES.find(a => a.type === selectedActivityType)?.emoji} {ACTIVITY_TYPES.find(a => a.type === selectedActivityType)?.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

