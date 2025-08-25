import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Priority, TaskCategory } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const bootcampSchedule = [
  { title: 'Wake up', category: TaskCategory.LEARNING, targetMinutes: null, priority: Priority.MEDIUM, time: '7:45' },
  { title: 'Exercise', category: TaskCategory.LEARNING, targetMinutes: 60, priority: Priority.HIGH, time: '8:00-9:00' },
  { title: 'Breakfast, cleaning and bath', category: TaskCategory.LEARNING, targetMinutes: 60, priority: Priority.MEDIUM, time: '9:00-10:00' },
  { title: 'DSA Practice', category: TaskCategory.DSA, targetMinutes: 75, priority: Priority.HIGH, time: '10:00-11:15' },
  { title: 'Break', category: TaskCategory.LEARNING, targetMinutes: 15, priority: Priority.LOW, time: '11:15-11:30' },
  { title: 'Work/Project Development', category: TaskCategory.PROJECT, targetMinutes: 75, priority: Priority.HIGH, time: '11:30-12:45' },
  { title: 'Lunch', category: TaskCategory.LEARNING, targetMinutes: 60, priority: Priority.MEDIUM, time: '12:45-1:45' },
  { title: 'Work Session', category: TaskCategory.PROJECT, targetMinutes: 75, priority: Priority.HIGH, time: '2:00-3:15' },
  { title: 'Break', category: TaskCategory.LEARNING, targetMinutes: 15, priority: Priority.LOW, time: '3:15-3:30' },
  { title: 'Work Session', category: TaskCategory.PROJECT, targetMinutes: 75, priority: Priority.HIGH, time: '3:30-4:45' },
  { title: 'Project Time', category: TaskCategory.PROJECT, targetMinutes: 120, priority: Priority.HIGH, time: '5:00-7:00' },
  { title: 'Badminton, dinner, bath etc', category: TaskCategory.LEARNING, targetMinutes: 240, priority: Priority.MEDIUM, time: '7:00-11:00' },
  { title: 'Daily reflection writing', category: TaskCategory.WRITING, targetMinutes: 60, priority: Priority.HIGH, time: '11:00-12:00' },
];

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range (max 2 months)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 60) {
      return NextResponse.json({ error: 'Date range cannot exceed 60 days' }, { status: 400 });
    }

    // Generate all dates in range
    const dates = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get all existing tasks in one query to avoid N+1 problem
    const existingTasks = await prisma.dailyTask.findMany({
      where: {
        userId: user.id,
        date: {
          gte: start,
          lte: end,
        },
        title: {
          in: bootcampSchedule.map((item) => item.title),
        },
      },
      select: {
        date: true,
        title: true,
      },
    });

    // Create a Set for O(1) lookup of existing tasks
    const existingTasksSet = new Set(existingTasks.map((task) => `${task.date.toISOString().split('T')[0]}_${task.title}`));

    // Generate all tasks that need to be created
    const tasksToCreate: {
      date: Date;
      title: string;
      category: TaskCategory;
      targetMinutes: number | null;
      priority: Priority;
      userId: string;
    }[] = [];
    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];

      for (const scheduleItem of bootcampSchedule) {
        const taskKey = `${dateStr}_${scheduleItem.title}`;

        if (!existingTasksSet.has(taskKey)) {
          tasksToCreate.push({
            date: new Date(date),
            title: scheduleItem.title,
            category: scheduleItem.category,
            targetMinutes: scheduleItem.targetMinutes,
            priority: scheduleItem.priority,
            userId: user.id,
          });
        }
      }
    }

    // Create all tasks in a single batch operation
    let createdCount = 0;
    if (tasksToCreate.length > 0) {
      // Use a transaction for better data integrity
      const result = await prisma.$transaction(async (tx) => {
        return await tx.dailyTask.createMany({
          data: tasksToCreate,
          skipDuplicates: true,
        });
      });
      createdCount = result.count;
    }

    return NextResponse.json({
      message: `Successfully created ${createdCount} tasks`,
      tasksCreated: createdCount,
      totalDays: dates.length,
    });
  } catch (error) {
    console.error('Auto-fill tasks error:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
