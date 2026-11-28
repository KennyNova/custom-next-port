import Image from 'next/image'

export function MidiDeckScreenshot() {
  return (
    <div className="space-y-3">
      <div className="relative aspect-[1629/1025] overflow-hidden rounded-xl border-2 shadow-lg">
        <Image
          src="/projects/midi-deck/app.jpg"
          alt="Midi Deck with the virtual controller's piano, pads, knob, fader and encoder, and a list of bindings like Mute mic on Ctrl+Shift+M"
          fill
          className="object-cover object-top"
          sizes="(max-width: 1024px) 100vw, 58vw"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        The packaged Windows build, running its built-in virtual controller.
      </p>
    </div>
  )
}
