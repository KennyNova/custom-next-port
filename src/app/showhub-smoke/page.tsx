const embedConfig = {
  embedSrc: "https://showhubco.com/embed.js",
  podcastId: "kd75wbfmwvbwzvphfm6973568n8bmm36",
  devplan: "free",
  theme: "auto",
  style: "full",
  maxEpisodes: "50",
  container: "podcastsaas-player",
  apiBase: "https://bold-deer-931.convex.site"
};

export default function ShowHubSmokePage() {
  return (
    <div data-testid="showhub-smoke-page" className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold">Show Hub Smoke Test</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page is used to validate real-domain embed behavior on `navidmadani.com`.
      </p>

      <div className="mt-4 rounded border border-slate-700 bg-slate-950/40 p-4 text-sm">
        <p>
          <strong>Embed source:</strong> {embedConfig.embedSrc}
        </p>
        <p>
          <strong>Podcast ID:</strong> {embedConfig.podcastId}
        </p>
        <p>
          <strong>API base:</strong> {embedConfig.apiBase}
        </p>
        <p>
          <strong>Configured:</strong> yes
        </p>
      </div>

      <div className="mt-8">
        <div id={embedConfig.container} className="min-h-[200px] rounded border border-slate-700 p-4">
          Loading Show Hub embed...
        </div>
      </div>

      <script
        async
        src={embedConfig.embedSrc}
        data-podcast-id={embedConfig.podcastId}
        data-devplan={embedConfig.devplan}
        data-theme={embedConfig.theme}
        data-style={embedConfig.style}
        data-max-episodes={embedConfig.maxEpisodes}
        data-container={embedConfig.container}
        data-api-base={embedConfig.apiBase}
      />
    </div>
  );
}
