import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ weekNumber: string }> }
) {
  try {
    const user = await requireAuth()
    const { weekNumber } = await params
    const weekNum = parseInt(weekNumber)

    // Validate week number
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 8) {
      return NextResponse.json(
        { error: 'Week number must be between 1 and 8' },
        { status: 400 }
      )
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { startDate: true }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const startDate = new Date(userProfile.startDate)
    const weekStartDate = new Date(startDate.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000)
    const weekEndDate = new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000)

    const dailyNotes = await prisma.dailyNote.findMany({
      where: {
        userId: user.id,
        date: {
          gte: weekStartDate,
          lte: weekEndDate
        }
      },
      include: {
        tasks: true
      }
    })

    const tasks = await prisma.dailyTask.findMany({
      where: {
        userId: user.id,
        date: {
          gte: weekStartDate,
          lte: weekEndDate
        }
      }
    })

    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.completed).length
    const avgCompletionRate = totalTasks > 0 ? completedTasks / totalTasks : 0
    const totalMinutes = tasks.reduce((sum, task) => sum + (task.actualMinutes || 0), 0)

    // Validate that there's enough data for a meaningful report
    const currentDate = new Date()
    const isCurrentOrFutureWeek = weekEndDate > currentDate

    if (totalTasks === 0 && isCurrentOrFutureWeek) {
      return NextResponse.json({
        warning: 'No tasks found for this week yet. Report may be incomplete.',
        hasMinimalData: false
      }, { status: 200 })
    }

    const dsaTasksCompleted = tasks.filter(task => task.category === 'DSA' && task.completed).length
    const projectTasksCompleted = tasks.filter(task => task.category === 'PROJECT' && task.completed).length
    const writingTasksCompleted = tasks.filter(task => task.category === 'WRITING' && task.completed).length

    // Check for minimum completion threshold
    const hasMinimalData = totalTasks >= 5 || !isCurrentOrFutureWeek

    const autoSummary = generateWeeklySummary({
      totalTasks,
      completedTasks,
      avgCompletionRate,
      dsaTasksCompleted,
      projectTasksCompleted,
      writingTasksCompleted,
      dailyNotes
    })

    const report = await prisma.weeklyReport.upsert({
      where: {
        userId_weekNumber: { userId: user.id, weekNumber: weekNum }
      },
      update: {
        totalTasks,
        completedTasks,
        avgCompletionRate,
        totalMinutes,
        dsaTasksCompleted,
        projectTasksCompleted,
        writingTasksCompleted,
        autoSummary
      },
      create: {
        userId: user.id,
        weekNumber: weekNum,
        startDate: weekStartDate,
        endDate: weekEndDate,
        totalTasks,
        completedTasks,
        avgCompletionRate,
        totalMinutes,
        dsaTasksCompleted,
        projectTasksCompleted,
        writingTasksCompleted,
        autoSummary
      }
    })

    return NextResponse.json({ 
      report,
      hasMinimalData,
      validationInfo: {
        totalTasks,
        weekRange: `${weekStartDate.toISOString().split('T')[0]} to ${weekEndDate.toISOString().split('T')[0]}`,
        isCurrentOrFutureWeek,
        dataQuality: hasMinimalData ? 'sufficient' : 'minimal'
      }
    })
  } catch (error) {
    console.error('Generate weekly report error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateWeeklySummary(data: {
  totalTasks: number
  completedTasks: number
  avgCompletionRate: number
  dsaTasksCompleted: number
  projectTasksCompleted: number
  writingTasksCompleted: number
  dailyNotes: any[]
}) {
  const { totalTasks, completedTasks, avgCompletionRate, dsaTasksCompleted, projectTasksCompleted, writingTasksCompleted } = data
  
  const completionPercent = Math.round(avgCompletionRate * 100)
  
  let strongestArea = 'DSA'
  let strongestCount = dsaTasksCompleted
  
  if (projectTasksCompleted > strongestCount) {
    strongestArea = 'Projects'
    strongestCount = projectTasksCompleted
  }
  
  if (writingTasksCompleted > strongestCount) {
    strongestArea = 'Writing'
    strongestCount = writingTasksCompleted
  }
  
  let needsImprovement = 'DSA'
  let lowestCount = dsaTasksCompleted
  
  if (projectTasksCompleted < lowestCount) {
    needsImprovement = 'Projects'
    lowestCount = projectTasksCompleted
  }
  
  if (writingTasksCompleted < lowestCount) {
    needsImprovement = 'Writing'
  }

  return `This week you completed ${completedTasks}/${totalTasks} tasks (${completionPercent}% completion rate). Strongest area: ${strongestArea} (${strongestCount} completed). ${strongestArea !== needsImprovement ? `Needs improvement: ${needsImprovement}.` : 'Great consistent performance across all categories!'}`
}