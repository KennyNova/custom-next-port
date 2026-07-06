'use client'

import dynamic from 'next/dynamic'
import { isClerkConfiguredClient } from '@/lib/clerk-config'
import { SignaturesPageSkeleton } from '@/components/ui/signatures-skeleton'
import { SignaturesOffline } from './signatures-offline'

const SignaturesWithClerk = dynamic(() => import('./signatures-with-clerk'), {
  ssr: false,
  loading: () => <SignaturesPageSkeleton />,
})

export default function SignaturesPage() {
  if (!isClerkConfiguredClient()) {
    return <SignaturesOffline />
  }

  return <SignaturesWithClerk />
}
