import { NextResponse } from "next/server";

const embedConfig = {
  embedSrc: "https://showhubco.com/embed.js",
  podcastId: "kd75wbfmwvbwzvphfm6973568n8bmm36",
  devplan: "free",
  theme: "auto",
  style: "full",
  maxEpisodes: "50",
  container: "podcastsaas-player",
  apiBase: "https://bold-deer-931.convex.cloud"
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: true,
    ...embedConfig
  });
}
