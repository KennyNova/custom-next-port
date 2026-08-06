import Script from "next/script";

export default function ShowHubFullPage() {
  return (
    <Script
      src="https://showhubco.com/embed.js"
      strategy="afterInteractive"
      data-podcast-id="kd75wbfmwvbwzvphfm6973568n8bmm36"
      data-devplan="free"
      data-style="full"
      data-template="default"
      data-max-episodes="24"
    />
  );
}
