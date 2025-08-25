import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ weekNumber: string }> }
) {
  try {
    const user = await requireAuth()
    const { weekNumber } = await params
    const weekNum = parseInt(weekNumber)

    const report = await prisma.weeklyReport.findFirst({
      where: {
        userId: user.id,
        weekNumber: weekNum
      }
    })

    if (!report) {
      return NextResponse.json({ error: 'Weekly report not found' }, { status: 404 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Get weekly report error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ weekNumber: string }> }
) {
  try {
    const user = await requireAuth()
    const { weekNumber } = await params
    const { blogDraft, reflections, nextWeekGoals, published } = await request.json()
    const weekNum = parseInt(weekNumber)

    const updateData: any = {}
    
    if (blogDraft !== undefined) updateData.blogDraft = blogDraft
    if (reflections !== undefined) updateData.reflections = reflections
    if (nextWeekGoals !== undefined) updateData.nextWeekGoals = nextWeekGoals
    if (published !== undefined) {
      updateData.published = published
      if (published) updateData.publishedAt = new Date()
    }

    const report = await prisma.weeklyReport.update({
      where: {
        userId_weekNumber: { userId: user.id, weekNumber: weekNum }
      },
      data: updateData
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Update weekly report error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}