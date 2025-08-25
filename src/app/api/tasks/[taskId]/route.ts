import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await requireAuth()
    const { taskId } = await params
    const { completed, actualMinutes, skipReason } = await request.json()

    const existingTask = await prisma.dailyTask.findFirst({
      where: {
        id: taskId,
        userId: user.id
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updateData: any = {}
    
    if (completed !== undefined) {
      updateData.completed = completed
      updateData.completedAt = completed ? new Date() : null
    }
    
    if (actualMinutes !== undefined) {
      updateData.actualMinutes = actualMinutes
    }
    
    if (skipReason !== undefined) {
      updateData.skipReason = skipReason
    }

    const task = await prisma.dailyTask.update({
      where: { id: taskId },
      data: updateData
    })

    if (skipReason) {
      await updateDailyNoteWithSkipReason(user.id, existingTask.date, existingTask.title, skipReason)
    }

    await updateDailyNoteMetrics(user.id, existingTask.date)

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Update task error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await requireAuth()
    const { taskId } = await params

    const existingTask = await prisma.dailyTask.findFirst({
      where: {
        id: taskId,
        userId: user.id
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.dailyTask.delete({
      where: { id: taskId }
    })

    await updateDailyNoteMetrics(user.id, existingTask.date)

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Delete task error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateDailyNoteWithSkipReason(
  userId: string,
  date: Date,
  taskTitle: string,
  skipReason: string
) {
  const existingNote = await prisma.dailyNote.findFirst({
    where: { userId, date }
  })

  const skipText = `${taskTitle} - ${skipReason}`
  
  if (existingNote) {
    const currentAutoContent = existingNote.autoContent || ''
    const newAutoContent = currentAutoContent 
      ? `${currentAutoContent}\n${skipText}`
      : `Tasks not completed: ${skipText}`

    await prisma.dailyNote.update({
      where: { id: existingNote.id },
      data: { autoContent: newAutoContent }
    })
  } else {
    await prisma.dailyNote.create({
      data: {
        userId,
        date,
        autoContent: `Tasks not completed: ${skipText}`
      }
    })
  }
}

async function updateDailyNoteMetrics(userId: string, date: Date) {
  const tasks = await prisma.dailyTask.findMany({
    where: { userId, date }
  })

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0
  const totalMinutes = tasks.reduce((sum, task) => sum + (task.actualMinutes || 0), 0)

  await prisma.dailyNote.upsert({
    where: { 
      userId_date: { userId, date } 
    },
    update: {
      totalTasks,
      completedTasks,
      completionRate,
      totalMinutes
    },
    create: {
      userId,
      date,
      totalTasks,
      completedTasks,
      completionRate,
      totalMinutes
    }
  })
}