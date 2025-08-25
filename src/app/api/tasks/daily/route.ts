import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { TaskCategory, Priority } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { date, title, category, targetMinutes, priority, scheduledTime } = await request.json()

    if (!date || !title || !category) {
      return NextResponse.json(
        { error: 'Date, title, and category are required' },
        { status: 400 }
      )
    }

    const task = await prisma.dailyTask.create({
      data: {
        date: new Date(date),
        title,
        category: category as TaskCategory,
        targetMinutes,
        priority: priority as Priority || 'MEDIUM',
        scheduledTime,
        userId: user.id
      }
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Create daily task error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}