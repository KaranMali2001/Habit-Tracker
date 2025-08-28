import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useUser() {
  const router = useRouter()
  
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
        }
        throw new Error('Failed to fetch user')
      }
      const data = await response.json()
      return data.user
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized)
      if (error.message.includes('401')) {
        return false
      }
      return failureCount < 2
    }
  })
}

export function useLogout() {
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST' 
      })
      
      if (!response.ok) {
        throw new Error('Logout failed')
      }
      
      return response.json()
    },
    onSuccess: () => {
      router.push('/login')
    },
  })
}