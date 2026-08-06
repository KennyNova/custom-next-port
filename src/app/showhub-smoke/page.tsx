const apiBase = "https://bold-deer-931.convex.site";
const embedSrc = "https://showhubco.com/embed.js";
const podcastId = "kd75wbfmwvbwzvphfm6973568n8bmm36";

const embeds = [
  {
    label: "Full player",
    container: "podcastsaas-player",
    embedSrc,
    podcastId,
    devplan: "free",
    theme: "auto",
    style: "full",
    maxEpisodes: "50",
    apiBase
  },
  {
    label: "Recent list",
    container: "podcastsaas-recent-list",
    embedSrc: `${embedSrc}?instance=recent-list`,
    podcastId,
    devplan: "free",
    style: "list",
    maxEpisodes: "3",
    section: "recent",
    apiBase
  }
] as const;

export default function ShowHubSmokePage() {
  return (
    <div data-testid="showhub-smoke-page" className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold">Show Hub Smoke Test</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page is used to validate real-domain embed behavior on `navidmadani.com`.
      </p>

      {embeds.map((embed) => (
        <section key={embed.container} className="mt-8">
          <h2 className="text-xl font-semibold">{embed.label}</h2>

          <div className="mt-4 rounded border border-slate-700 bg-slate-950/40 p-4 text-sm">
            <p>
              <strong>Container:</strong> {embed.container}
            </p>
            <p>
              <strong>Style:</strong> {embed.style}
            </p>
            {"section" in embed ? (
              <p>
                <strong>Section:</strong> {embed.section}
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <div id={embed.container} className="min-h-[200px] rounded border border-slate-700 p-4">
              Loading Show Hub embed...
            </div>
          </div>

          <script
            src={embed.embedSrc}
            data-podcast-id={embed.podcastId}
            data-devplan={embed.devplan}
            data-style={embed.style}
            data-max-episodes={embed.maxEpisodes}
            data-container={embed.container}
            data-api-base={embed.apiBase}
            {...("theme" in embed ? { "data-theme": embed.theme } : {})}
            {...("section" in embed ? { "data-section": embed.section } : {})}
          />
        </section>
      ))}
    </div>
  );
}
