import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Mood } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const user = await requireAuth()
    const { date } = await params
    const dateObj = new Date(date)

    const note = await prisma.dailyNote.findFirst({
      where: {
        userId: user.id,
        date: dateObj
      },
      include: {
        tasks: true
      }
    })

    if (!note) {
      const emptyNote = await prisma.dailyNote.create({
        data: {
          userId: user.id,
          date: dateObj
        },
        include: {
          tasks: true
        }
      })
      return NextResponse.json({ note: emptyNote })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Get daily note error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const user = await requireAuth()
    const { date } = await params
    const { userContent, learnings, challenges, tomorrowPlan, energyLevel, mood } = await request.json()
    const dateObj = new Date(date)

    const note = await prisma.dailyNote.upsert({
      where: {
        userId_date: { userId: user.id, date: dateObj }
      },
      update: {
        userContent,
        learnings,
        challenges,
        tomorrowPlan,
        energyLevel,
        mood: mood as Mood
      },
      create: {
        userId: user.id,
        date: dateObj,
        userContent,
        learnings,
        challenges,
        tomorrowPlan,
        energyLevel: energyLevel || 5,
        mood: mood as Mood || 'NEUTRAL'
      },
      include: {
        tasks: true
      }
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Update daily note error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}