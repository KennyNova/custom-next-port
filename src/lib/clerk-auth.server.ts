import 'server-only'

import { auth } from '@clerk/nextjs/server'
import { isClerkConfigured } from '@/lib/clerk-config'

export async function getAuthUserId(): Promise<string | null> {
  if (!isClerkConfigured()) {
    return null
  }

  const { userId } = await auth()
  return userId ?? null
}
