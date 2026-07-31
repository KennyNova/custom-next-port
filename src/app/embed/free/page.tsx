import Script from 'next/script'

export default function EmbedFreePage() {
  return (
    <Script
      src="https://cdn.podcastsaas.com/embed.js"
      data-podcast-id="PODCAST_ID_FREE"
      data-theme="dark"
      data-max-episodes="10"
      strategy="afterInteractive"
    />
  )
}
