'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import {
  getPostHogProjectToken,
  getPostHogUiHost,
  isPostHogConfigured,
} from '@/lib/posthog/config'

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isPostHogConfigured()) {
      return
    }

    const query = searchParams?.toString()
    const url = `${window.location.origin}${pathname}${query ? `?${query}` : ''}`

    posthog.capture('$pageview', {
      $current_url: url,
    })
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const projectToken = getPostHogProjectToken()
    if (!projectToken) {
      return
    }

    posthog.init(projectToken, {
      api_host: '/ingest',
      ui_host: getPostHogUiHost(),
      person_profiles: 'identified_only',
      capture_pageview: false,
      capture_pageleave: true,
      capture_exceptions: true,
      autocapture: true,
      defaults: '2026-01-30',
      debug: process.env.NODE_ENV === 'development',
    })
  }, [])

  if (!isPostHogConfigured()) {
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}
