import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's tasks
    const todayTasks = await prisma.dailyTask.findMany({
      where: {
        userId: user.id,
        date: today
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledTime: 'asc' }
      ]
    })

    // Get today's note for energy and mood
    const todayNote = await prisma.dailyNote.findFirst({
      where: {
        userId: user.id,
        date: today
      }
    })

    // Calculate stats
    const totalTasks = todayTasks.length
    const completedTasks = todayTasks.filter(task => task.completed).length
    const inProgressTasks = todayTasks.filter(task => !task.completed && task.actualMinutes && task.actualMinutes > 0).length
    const totalMinutes = todayTasks.reduce((sum, task) => sum + (task.actualMinutes || 0), 0)

    // Get recent completed tasks (last 7 days)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentCompletedTasks = await prisma.dailyTask.findMany({
      where: {
        userId: user.id,
        completed: true,
        date: {
          gte: sevenDaysAgo,
          lt: tomorrow
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 10
    })

    // Transform tasks for frontend
    const transformedTasks = todayTasks.map(task => ({
      id: task.id,
      title: task.title,
      category: task.category,
      priority: task.priority,
      completed: task.completed,
      targetMinutes: task.targetMinutes,
      actualMinutes: task.actualMinutes,
      scheduledTime: task.scheduledTime,
      time: task.scheduledTime || 'Unscheduled',
      duration: task.targetMinutes ? `${task.targetMinutes}min` : 'No limit',
      status: task.completed ? 'completed' : (task.actualMinutes && task.actualMinutes > 0 ? 'in_progress' : 'todo')
    }))

    const stats = [
      {
        label: 'Tasks Today',
        value: totalTasks.toString(),
        icon: 'CheckSquare',
        color: 'text-blue-500'
      },
      {
        label: 'Completed',
        value: completedTasks.toString(),
        icon: 'CheckCircle',
        color: 'text-green-500'
      },
      {
        label: 'Focus Time',
        value: `${Math.round(totalMinutes / 60 * 10) / 10}h`,
        icon: 'Clock',
        color: 'text-purple-500'
      },
      {
        label: 'Completion Rate',
        value: totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%',
        icon: 'TrendingUp',
        color: 'text-orange-500'
      }
    ]

    const dashboard = {
      stats,
      tasks: transformedTasks,
      todayInsights: {
        focusTime: totalMinutes,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        energyLevel: todayNote?.energyLevel || 5
      },
      recentCompleted: recentCompletedTasks.map(task => ({
        id: task.id,
        title: task.title,
        completedAt: task.completedAt
      }))
    }

    return NextResponse.json({ dashboard })
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}