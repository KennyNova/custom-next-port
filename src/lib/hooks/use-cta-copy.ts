'use client'

import { useEffect, useMemo, useState } from 'react'

export type CtaVariant = {
  id: string
  text: string
}

const CTA_VARIANTS: CtaVariant[] = [
  { id: 'learn-help', text: 'Learn how I can help you' },
  { id: 'personalized-plan', text: 'Get your personalized plan' },
  { id: 'best-next-step', text: 'Discover your best next step' },
  { id: 'right-solution', text: 'Find the right solution for your business' },
]

const STORAGE_KEY = 'nm_cta_variant_v1'

function parseStoredVariant(raw: string | null): number | null {
  if (!raw) return null
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) return null
  if (parsed < 0 || parsed >= CTA_VARIANTS.length) return null
  return parsed
}

function getAssignedVariantIndex(): number {
  const stored = parseStoredVariant(window.localStorage.getItem(STORAGE_KEY))
  if (stored !== null) return stored

  const randomIndex = Math.floor(Math.random() * CTA_VARIANTS.length)
  window.localStorage.setItem(STORAGE_KEY, String(randomIndex))
  return randomIndex
}

export function useCtaCopy() {
  const [variantIndex, setVariantIndex] = useState(0)

  useEffect(() => {
    setVariantIndex(getAssignedVariantIndex())
  }, [])

  const variant = useMemo(() => CTA_VARIANTS[variantIndex] ?? CTA_VARIANTS[0], [variantIndex])

  return {
    id: variant.id,
    text: variant.text,
    allVariants: CTA_VARIANTS,
  }
}
