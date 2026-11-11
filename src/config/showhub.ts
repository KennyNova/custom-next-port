/**
 * Show Hub content shown on the site.
 *
 * To show something new, add a block below. Blocks with `featured: true`
 * appear in the homepage section; every block appears on /media.
 *
 * Any Show Hub embed option that isn't modelled here can be passed through
 * `attributes` as a raw `data-*` attribute, e.g. `{ 'data-recent-mode': 'latest' }`.
 */

export const SHOWHUB_EMBED_SRC = 'https://showhubco.com/embed.js'

/** Sections the Show Hub embed script knows how to render. */
export type ShowHubSectionKind =
  | 'full-player'
  | 'recent'
  | 'all-episodes'
  | 'episode'
  | 'premiere'
  | 'sticky'
  | 'playlist'
  | 'archive'
  | 'clips'
  | 'guests'
  | 'subscribe'
  | 'signup'
  | 'ask'

export type ShowHubBlock = {
  /** Unique, URL-safe. Used for the embed container id. */
  id: string
  title: string
  description?: string
  /** Show Hub content (podcast/show) id. */
  contentId: string
  /** Which Show Hub view to render. Defaults to the embed's full player. */
  section?: ShowHubSectionKind
  /** Embed layout, e.g. 'full' or 'list'. */
  style?: string
  template?: string
  maxEpisodes?: number
  episodeId?: string
  seasonId?: string
  /** Force a colour scheme. By default it follows the site theme. */
  theme?: 'light' | 'dark' | 'auto'
  devplan?: string
  /** Override the API origin (normally derived from the embed script URL). */
  apiBase?: string
  /** Show this block in the homepage section. */
  featured?: boolean
  /** Extra raw data-* attributes passed straight to the embed script. */
  attributes?: Record<`data-${string}`, string>
}

export const showHubConfig: {
  heading: string
  intro: string
  blocks: ShowHubBlock[]
} = {
  heading: 'Watch & listen',
  intro: 'Episodes and clips I’ve published, loaded live from Show Hub.',
  blocks: [
    {
      id: 'playlist',
      title: 'Playlist',
      contentId: 'kd7cs02220hswb3hr4pn5rgmnd8c1nh9',
      section: 'playlist',
      maxEpisodes: 5,
      featured: true,
      attributes: {
        'data-controls': 'full',
        'data-show-thumbnails': 'true',
        'data-show-chapter': 'true',
        'data-look': 'theme',
      },
    },
    {
      id: 'latest',
      title: 'Latest episodes',
      contentId: 'kd75wbfmwvbwzvphfm6973568n8bmm36',
      section: 'recent',
      style: 'list',
      maxEpisodes: 3,
    },
    {
      id: 'player',
      title: 'All episodes',
      contentId: 'kd75wbfmwvbwzvphfm6973568n8bmm36',
      style: 'full',
      template: 'default',
      maxEpisodes: 24,
    },
  ],
}

export const featuredShowHubBlocks = showHubConfig.blocks.filter((b) => b.featured)
