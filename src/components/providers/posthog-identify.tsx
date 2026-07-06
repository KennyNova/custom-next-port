'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import posthog from 'posthog-js'
import { isClerkConfigured } from '@/lib/clerk-config'
import { isPostHogConfigured } from '@/lib/posthog/config'

export function PostHogIdentify() {
  const { user, isLoaded } = useUser()
  const lastUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!isPostHogConfigured() || !isClerkConfigured() || !isLoaded) {
      return
    }

    if (user) {
      if (lastUserId.current !== user.id) {
        posthog.identify(user.id, {
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName ?? undefined,
          username: user.username ?? undefined,
        })
        lastUserId.current = user.id
      }
      return
    }

    if (lastUserId.current) {
      posthog.reset()
      lastUserId.current = null
    }
  }, [user, isLoaded])

  return null
}
