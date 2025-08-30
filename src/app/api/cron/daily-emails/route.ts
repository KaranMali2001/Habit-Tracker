import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDailyScheduleEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify that the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5:30 hours in milliseconds
    const istDate = new Date(now.getTime() + istOffset);
    const todayIST = istDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    console.log(`Starting daily email cron job for date: ${todayIST}`);

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json({ 
        message: 'No users found',
        date: todayIST,
        emailsSent: 0 
      });
    }

    const emailResults = [];

    // Process each user
    for (const user of users) {
      try {
        // Get today's tasks for the user
        const tasks = await prisma.dailyTask.findMany({
          where: {
            userId: user.id,
            date: new Date(todayIST),
          },
          select: {
            title: true,
            category: true,
            scheduledTime: true,
            priority: true,
            targetMinutes: true,
          },
          orderBy: [
            { scheduledTime: 'asc' },
            { priority: 'desc' },
          ],
        });

        // Format date for display
        const formattedDate = new Date(todayIST).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Send email
        await sendDailyScheduleEmail(
          user.email,
          user.name,
          tasks.map(task => ({
            title: task.title,
            category: task.category,
            scheduledTime: task.scheduledTime,
            priority: task.priority,
            targetMinutes: task.targetMinutes,
          })),
          formattedDate
        );

        emailResults.push({
          userId: user.id,
          email: user.email,
          success: true,
          tasksCount: tasks.length,
        });

        console.log(`Email sent successfully to ${user.email} with ${tasks.length} tasks`);
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        emailResults.push({
          userId: user.id,
          email: user.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Summary
    const successCount = emailResults.filter(r => r.success).length;
    const failureCount = emailResults.filter(r => !r.success).length;

    console.log(`Daily email cron job completed. Success: ${successCount}, Failures: ${failureCount}`);

    return NextResponse.json({
      message: 'Daily email cron job completed',
      date: todayIST,
      totalUsers: users.length,
      emailsSent: successCount,
      emailsFailed: failureCount,
      results: emailResults,
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support POST for testing purposes
export async function POST(request: NextRequest) {
  return GET(request);
}