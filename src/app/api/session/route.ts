import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find active session (task that's in progress)
    const activeTask = await prisma.dailyTask.findFirst({
      where: {
        userId: user.id,
        date: today,
        completed: false,
        actualMinutes: {
          gt: 0
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!activeTask) {
      return NextResponse.json({ session: null })
    }

    const session = {
      taskId: activeTask.id,
      title: activeTask.title,
      category: activeTask.category,
      priority: activeTask.priority,
      startTime: activeTask.scheduledTime || '10:00',
      targetMinutes: activeTask.targetMinutes || 75,
      actualMinutes: activeTask.actualMinutes || 0,
      progress: activeTask.targetMinutes 
        ? Math.min((activeTask.actualMinutes || 0) / activeTask.targetMinutes * 100, 100)
        : 35 // Default progress if no target
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Session fetch error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { taskId, action } = await request.json()

    if (!taskId || !action) {
      return NextResponse.json(
        { error: 'Task ID and action are required' },
        { status: 400 }
      )
    }

    const task = await prisma.dailyTask.findFirst({
      where: {
        id: taskId,
        userId: user.id
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    let updatedTask

    switch (action) {
      case 'start':
      case 'resume':
        // Initialize actualMinutes if not set
        if (!task.actualMinutes) {
          updatedTask = await prisma.dailyTask.update({
            where: { id: taskId },
            data: { 
              actualMinutes: 0,
              updatedAt: new Date()
            }
          })
        }
        break

      case 'pause':
        // Task is already tracked by actualMinutes, no specific pause state needed
        break

      case 'complete':
        updatedTask = await prisma.dailyTask.update({
          where: { id: taskId },
          data: { 
            completed: true,
            completedAt: new Date(),
            actualMinutes: task.actualMinutes || task.targetMinutes || 0
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ 
      success: true, 
      task: updatedTask || task,
      message: `Task ${action}ed successfully`
    })
  } catch (error) {
    console.error('Session action error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { taskId, actualMinutes } = await request.json()

    if (!taskId || actualMinutes === undefined) {
      return NextResponse.json(
        { error: 'Task ID and actual minutes are required' },
        { status: 400 }
      )
    }

    const updatedTask = await prisma.dailyTask.update({
      where: {
        id: taskId,
        userId: user.id
      },
      data: {
        actualMinutes: Math.max(0, actualMinutes),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      task: updatedTask 
    })
  } catch (error) {
    console.error('Session update error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}