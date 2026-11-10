import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  label?: string
}

// The logo is drawn as three masked layers (tile, accent, letter) so each
// theme can recolor it via the --logo-* variables in globals.css.
export function BrandLogo({ className, label = 'Navid Madani logo' }: BrandLogoProps) {
  return (
    <span role="img" aria-label={label} className={cn('brand-logo h-8 w-8', className)}>
      <span className="brand-logo-tile" />
      <span className="brand-logo-accent" />
      <span className="brand-logo-letter" />
    </span>
  )
}
