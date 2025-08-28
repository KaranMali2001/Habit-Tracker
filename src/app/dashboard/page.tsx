import ErrorPage from '@/components/errorPage';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/dashboard-client';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

export default async function Page() {
  const today = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00.000Z');
  const todayStr = today.toISOString().split('T')[0];
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  try {
    const queryClient = new QueryClient();

    // Pre-fetch data for React Query
    const [tasks, notes] = await Promise.all([
      prisma.dailyTask.findMany({
        where: {
          userId: user.id,
          date: today,
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      }),
      prisma.dailyNote.findFirst({
        where: {
          userId: user.id,
          date: today,
        },
        include: {
          tasks: true,
        },
      }),
    ]);

    let finalNotes = notes;
    if (!notes) {
      finalNotes = await prisma.dailyNote.create({
        data: {
          userId: user.id,
          date: today,
        },
        include: {
          tasks: true,
        },
      });
    }

    // Pre-populate the query cache
    queryClient.setQueryData(['tasks', todayStr], tasks);
    queryClient.setQueryData(['notes', todayStr], finalNotes);

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardClient 
          initialTasks={tasks} 
          initialNote={finalNotes} 
          user={user} 
        />
      </HydrationBoundary>
    );
  } catch (error) {
    console.error('Failed to fetch day data:', error);
    return (
      <div>
        <ErrorPage />
      </div>
    );
  }
}
