'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import {
  getPostHogProjectToken,
  getPostHogUiHost,
  isPostHogConfigured,
} from '@/lib/posthog/config'

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
      capture_pageview: 'history_change',
      capture_pageleave: true,
      capture_exceptions: true,
      autocapture: true,
      defaults: '2026-05-30',
      debug: process.env.NODE_ENV === 'development',
    })
  }, [])

  if (!isPostHogConfigured()) {
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}
