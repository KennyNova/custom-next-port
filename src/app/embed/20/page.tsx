import Script from 'next/script'

export default function Embed20Page() {
  return (
    <Script
      src="https://cdn.podcastsaas.com/embed.js"
      data-podcast-id="PODCAST_ID_20"
      data-theme="dark"
      data-max-episodes="10"
      strategy="afterInteractive"
    />
  )
}
