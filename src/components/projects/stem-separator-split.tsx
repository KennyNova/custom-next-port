// A drawn diagram of one song coming apart into the six stems Demucs' htdemucs_6s model returns.
const STEMS = [
  { name: 'Vocals', seed: 3, density: 0.55 },
  { name: 'Drums', seed: 7, density: 0.9 },
  { name: 'Bass', seed: 11, density: 0.7 },
  { name: 'Guitar', seed: 5, density: 0.5 },
  { name: 'Piano', seed: 13, density: 0.4 },
  { name: 'Other', seed: 17, density: 0.6 },
]

const BAR_COUNT = 48

// Deterministic, and rounded because Node and the browser can disagree on the last digits of Math.sin.
function bars(seed: number, density: number) {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const wave = Math.abs(Math.sin(i * 0.37 * seed) * Math.cos(i * 0.11 + seed))
    return Math.round((wave < 1 - density ? 0.08 : 0.2 + wave * 0.8) * 100) / 100
  })
}

const MIX = Array.from({ length: BAR_COUNT }, (_, i) =>
  Math.min(1, Math.round((STEMS.reduce((sum, stem) => sum + bars(stem.seed, stem.density)[i], 0) / 3.2) * 100) / 100)
)

function Wave({ values, className }: { values: number[]; className: string }) {
  return (
    <div className="flex h-full items-center gap-[2px]">
      {values.map((v, i) => (
        <span key={i} className={`flex-1 rounded-full ${className}`} style={{ height: `${Math.round(Math.max(v, 0.06) * 100)}%` }} />
      ))}
    </div>
  )
}

export function StemSeparatorSplit() {
  return (
    <div className="space-y-4 rounded-xl border-2 bg-card p-4 shadow-lg md:p-6">
      <div className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
        <span className="text-sm font-medium">Song</span>
        <div className="h-14">
          <Wave values={MIX} className="bg-foreground/70" />
        </div>
      </div>
      <div className="border-t" />
      {STEMS.map((stem) => (
        <div key={stem.name} className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
          <span className="text-sm text-muted-foreground">{stem.name}</span>
          <div className="h-8">
            <Wave values={bars(stem.seed, stem.density)} className="bg-primary/70" />
          </div>
        </div>
      ))}
    </div>
  )
}
