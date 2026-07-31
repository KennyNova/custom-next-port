import { NextResponse } from "next/server";

const defaultEmbedSrc = "https://showhubco.com/embed.js";

export async function GET() {
  const embedSrc = process.env.NEXT_PUBLIC_SHOWHUB_EMBED_SRC?.trim() || defaultEmbedSrc;
  const podcastId = process.env.NEXT_PUBLIC_SHOWHUB_PODCAST_ID?.trim() || "";
  const devplan = process.env.NEXT_PUBLIC_SHOWHUB_DEVPLAN?.trim() || "free";
  const theme = process.env.NEXT_PUBLIC_SHOWHUB_THEME?.trim() || "auto";
  const style = process.env.NEXT_PUBLIC_SHOWHUB_STYLE?.trim() || "full";
  const maxEpisodes = process.env.NEXT_PUBLIC_SHOWHUB_MAX_EPISODES?.trim() || "10";

  return NextResponse.json({
    ok: true,
    configured: podcastId.length > 0,
    embedSrc,
    podcastId,
    devplan,
    theme,
    style,
    maxEpisodes
  });
}
