import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DailyNote } from '@prisma/client'

export function useNotes(date: string) {
  return useQuery({
    queryKey: ['notes', date],
    queryFn: async () => {
      const response = await fetch(`/api/notes/${date}`)
      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }
      const data = await response.json()
      return data.note as DailyNote
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      date, 
      updates 
    }: { 
      date: string
      updates: { userContent?: string; learnings?: string } 
    }) => {
      const response = await fetch(`/api/notes/${date}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update note')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Update the cache optimistically
      queryClient.setQueryData(['notes', variables.date], (old: DailyNote) => 
        old ? { ...old, ...variables.updates } : old
      )
    },
  })
}