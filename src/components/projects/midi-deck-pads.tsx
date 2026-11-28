'use client'

import { useState } from 'react'

// Example bindings, the kind of thing Midi Deck is for. Not read from a real profile.
const PADS = [
  { label: 'Mute mic', keys: 'Ctrl + Shift + M' },
  { label: 'Play / pause', keys: 'Media Play' },
  { label: 'Next track', keys: 'Media Next' },
  { label: 'Screenshot', keys: 'Win + Shift + S' },
  { label: 'Scene: Camera', keys: 'Ctrl + F1' },
  { label: 'Scene: Screen', keys: 'Ctrl + F2' },
  { label: 'Open terminal', keys: 'Launch wt.exe' },
  { label: 'Lock PC', keys: 'Win + L' },
  { label: 'Undo', keys: 'Ctrl + Z' },
  { label: 'Redo', keys: 'Ctrl + Y' },
  { label: 'Save', keys: 'Ctrl + S' },
  { label: 'Type email', keys: 'Types text' },
]

const KNOBS = [
  { label: 'Volume', value: 0.7 },
  { label: 'Scroll', value: 0.35 },
]

export function MidiDeckPads() {
  const [active, setActive] = useState(0)
  const pad = PADS[active]

  return (
    <div className="rounded-xl border-2 bg-card p-4 shadow-lg md:p-6">
      <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border bg-background px-4 py-3 font-mono text-sm">
        <span className="text-muted-foreground">Pad {active + 1} · note {36 + active}</span>
        <span className="truncate text-primary">{pad.keys}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div className="grid grid-cols-4 gap-2">
          {PADS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={`flex h-16 items-end md:h-20 rounded-md border-2 p-2 text-left text-[11px] leading-tight transition-colors md:text-xs ${
                i === active ? 'border-primary bg-primary/15 text-foreground' : 'bg-secondary/60 text-muted-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col justify-around gap-4">
          {KNOBS.map((knob) => (
            <div key={knob.label} className="flex flex-col items-center gap-2">
              <div className="relative h-12 w-12 rounded-full border-2 bg-secondary/60">
                <span
                  className="absolute left-1/2 top-1/2 h-5 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full rounded bg-primary"
                  style={{ transform: `translate(-50%, -100%) rotate(${-135 + knob.value * 270}deg)` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{knob.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
