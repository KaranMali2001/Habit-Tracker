import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    let targetDate = new Date()
    if (date) {
      targetDate = new Date(date)
    }
    targetDate.setHours(0, 0, 0, 0)

    let note = await prisma.dailyNote.findFirst({
      where: {
        userId: user.id,
        date: targetDate
      }
    })

    // Create note if doesn't exist
    if (!note) {
      note = await prisma.dailyNote.create({
        data: {
          userId: user.id,
          date: targetDate,
          userContent: '',
          energyLevel: 5
        }
      })
    }

    return NextResponse.json({ 
      notes: note.userContent || '',
      energyLevel: note.energyLevel,
      mood: note.mood 
    })
  } catch (error) {
    console.error('Notes fetch error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { notes, date } = await request.json()

    let targetDate = new Date()
    if (date) {
      targetDate = new Date(date)
    }
    targetDate.setHours(0, 0, 0, 0)

    // Upsert the daily note
    const updatedNote = await prisma.dailyNote.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: targetDate
        }
      },
      update: {
        userContent: notes,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        date: targetDate,
        userContent: notes,
        energyLevel: 5
      }
    })

    return NextResponse.json({ 
      success: true,
      note: updatedNote
    })
  } catch (error) {
    console.error('Notes save error:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}