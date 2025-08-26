import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Fetch tasks within the date range
    const tasks = await prisma.dailyTask.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        title: true,
        category: true,
        priority: true,
        completed: true,
        skipReason: true,
        targetMinutes: true,
        completedAt: true,
        date: true,
        createdAt: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Fetch daily notes for mood/energy data
    const notes = await prisma.dailyNote.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        mood: true,
        energyLevel: true,
        completedTasks: true,
        totalTasks: true,
        completionRate: true,
        totalMinutes: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate daily completion rates
    const dailyCompletion = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const dayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.date).toISOString().split('T')[0];
        return taskDate === dateStr;
      });

      const totalTasks = dayTasks.length;
      const completedTasks = dayTasks.filter((task) => task.completed).length;
      const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

      dailyCompletion.push({
        date: dateStr,
        completionRate,
        totalTasks,
        completedTasks,
      });
    }

    // Calculate category distribution
    const categoryStats: Record<string, number> = {};
    tasks.forEach((task) => {
      if (task.completed) {
        categoryStats[task.category] = (categoryStats[task.category] || 0) + 1;
      }
    });

    const CATEGORY_COLORS: Record<string, string> = {
      DSA: '#ef4444',
      PROJECT: '#ec4899',
      WRITING: '#f97316',
      LEARNING: '#22c55e',
      APPLICATION: '#3b82f6',
      INTERVIEW_PREP: '#8b5cf6',
    };

    const categoryDistribution = Object.entries(categoryStats).map(([category, completed]) => ({
      category,
      completed,
      color: CATEGORY_COLORS[category] || '#6b7280',
    }));

    // Calculate weekly progress
    const weeklyProgress = [];
    const weeksToShow = Math.ceil(days / 7);

    for (let week = 0; week < weeksToShow; week++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + week * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekTasks = tasks.filter((task) => {
        const taskDate = new Date(task.date);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      const totalTasks = weekTasks.length;
      const completedTasks = weekTasks.filter((task) => task.completed).length;
      const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

      const weekNotes = notes.filter((note) => {
        const noteDate = new Date(note.date);
        return noteDate >= weekStart && noteDate <= weekEnd;
      });

      const totalMinutes = weekNotes.reduce((sum, note) => sum + (note.totalMinutes || 0), 0);

      weeklyProgress.push({
        week: week + 1,
        completionRate,
        totalMinutes,
      });
    }

    // Mood and energy data
    const moodEnergy = notes.map((note) => ({
      date: new Date(note.date).toISOString().split('T')[0],
      mood: note.mood || 3,
      energyLevel: note.energyLevel || 5,
    }));

    // Fill in missing dates with default values
    const moodEnergyComplete = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const existingData = moodEnergy.find((item) => item.date === dateStr);
      moodEnergyComplete.push(
        existingData || {
          date: dateStr,
          mood: 3,
          energyLevel: 5,
        }
      );
    }

    const analyticsData = {
      dailyCompletion,
      categoryDistribution,
      weeklyProgress,
      moodEnergy: moodEnergyComplete,
      summary: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.completed).length,
        skippedTasks: tasks.filter((t) => t.skipReason).length,
        avgCompletionRate: dailyCompletion.reduce((sum, day) => sum + day.completionRate, 0) / dailyCompletion.length,
        totalMinutes: notes.reduce((sum, note) => sum + (note.totalMinutes || 0), 0),
        avgEnergyLevel: moodEnergyComplete.reduce((sum, item) => sum + item.energyLevel, 0) / moodEnergyComplete.length,
      },
    };

    return NextResponse.json({ analytics: analyticsData });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}
