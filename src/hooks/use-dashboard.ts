import { useQuery } from '@tanstack/react-query'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAnalytics(dateRange: string = '30') {
  return useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics?days=${dateRange}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      const result = await response.json()
      return result.analytics
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}