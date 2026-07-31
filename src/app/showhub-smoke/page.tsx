const defaultEmbedSrc = "https://showhubco.com/embed.js";

function readConfig() {
  const embedSrc = process.env.NEXT_PUBLIC_SHOWHUB_EMBED_SRC?.trim() || defaultEmbedSrc;
  const podcastId = process.env.NEXT_PUBLIC_SHOWHUB_PODCAST_ID?.trim() || "";
  const devplan = process.env.NEXT_PUBLIC_SHOWHUB_DEVPLAN?.trim() || "free";
  const theme = process.env.NEXT_PUBLIC_SHOWHUB_THEME?.trim() || "auto";
  const style = process.env.NEXT_PUBLIC_SHOWHUB_STYLE?.trim() || "full";
  const maxEpisodes = process.env.NEXT_PUBLIC_SHOWHUB_MAX_EPISODES?.trim() || "10";

  return {
    embedSrc,
    podcastId,
    devplan,
    theme,
    style,
    maxEpisodes,
    configured: podcastId.length > 0
  };
}

export default function ShowHubSmokePage() {
  const config = readConfig();

  return (
    <div data-testid="showhub-smoke-page" className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold">Show Hub Smoke Test</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page is used to validate real-domain embed behavior on `navidmadani.com`.
      </p>

      <div className="mt-4 rounded border border-slate-700 bg-slate-950/40 p-4 text-sm">
        <p>
          <strong>Embed source:</strong> {config.embedSrc}
        </p>
        <p>
          <strong>Podcast ID:</strong> {config.podcastId || "(missing)"}
        </p>
        <p>
          <strong>Configured:</strong> {config.configured ? "yes" : "no"}
        </p>
      </div>

      {!config.configured ? (
        <div className="mt-4 rounded border border-amber-600/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          Set `NEXT_PUBLIC_SHOWHUB_PODCAST_ID` in this app to enable live embed rendering.
        </div>
      ) : null}

      <div className="mt-8">
        <div id="showhub-smoke-player" className="min-h-[200px] rounded border border-slate-700 p-4">
          Loading Show Hub embed...
        </div>
      </div>

      {config.configured ? (
        <script
          async
          src={config.embedSrc}
          data-podcast-id={config.podcastId}
          data-devplan={config.devplan}
          data-theme={config.theme}
          data-style={config.style}
          data-max-episodes={config.maxEpisodes}
          data-container="showhub-smoke-player"
        />
      ) : null}
    </div>
  );
}
