import ErrorPage from '@/components/errorPage';
import { getCurrentUser } from '@/lib/auth';
import { getAnalyticsData } from '@/lib/analytics';
import { redirect } from 'next/navigation';
import AnalyticsClient from '@/components/analytics/analytics-client';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  try {
    const queryClient = new QueryClient();
    
    // Directly query the database for analytics data (30 days default)
    const analyticsData = await getAnalyticsData(user.id, 30);

    // Pre-populate the query cache with server data
    queryClient.setQueryData(['analytics', '30'], analyticsData);
    queryClient.setQueryData(['user'], user);

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AnalyticsClient 
          initialAnalyticsData={analyticsData} 
          user={user} 
        />
      </HydrationBoundary>
    );
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    return (
      <div>
        <ErrorPage />
      </div>
    );
  }
}