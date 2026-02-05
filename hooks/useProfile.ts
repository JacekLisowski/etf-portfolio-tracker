import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { queryKeys } from './queryKeys'

export type UserProfile = {
  id: string
  email: string
  name: string | null
  language: 'PL' | 'EN'
  tier: 'FREE' | 'PREMIUM'
}

export type UpdateProfileData = {
  name?: string | null
  language?: 'PL' | 'EN'
}

async function fetchProfile(): Promise<UserProfile> {
  const response = await fetch('/api/user/profile')
  if (!response.ok) {
    throw new Error('Failed to fetch profile')
  }
  return response.json()
}

async function updateProfile(data: UpdateProfileData): Promise<UserProfile> {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update profile')
  }
  return response.json()
}

export function useProfile() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: queryKeys.profile.detail(session?.user?.id ?? ''),
    queryFn: fetchProfile,
    enabled: !!session?.user?.id,
    staleTime: 60_000, // Profile data is stable - 1 minute
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
    },
  })
}
