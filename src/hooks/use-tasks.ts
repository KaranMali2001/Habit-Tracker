import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DailyTask } from '@prisma/client'

export function useTasks(date: string) {
  return useQuery({
    queryKey: ['tasks', date],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/daily/${date}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      const data = await response.json()
      return data.tasks as DailyTask[]
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<DailyTask> }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update task')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch tasks for the date
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskData: {
      title: string
      category: string
      priority: string
      targetMinutes?: number
      scheduledTime?: string
      date: string
    }) => {
      const response = await fetch('/api/tasks/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}