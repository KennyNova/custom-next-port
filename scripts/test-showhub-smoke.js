#!/usr/bin/env node

const smokeUrl = process.env.SHOWHUB_SMOKE_URL || "https://navidmadani.com/showhub-smoke";

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    fail(`Request failed for ${url} with status ${response.status}`);
  }
  return await response.text();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    fail(`Request failed for ${url} with status ${response.status}`);
  }
  return await response.json();
}

async function main() {
  const target = new URL(smokeUrl);
  const pageHtml = await fetchText(target.toString());

  if (!pageHtml.includes('data-testid="showhub-smoke-page"')) {
    fail("Smoke page marker not found. Is /showhub-smoke deployed?");
  }
  pass("Smoke page marker present");

  if (!pageHtml.includes('id="showhub-smoke-player"')) {
    fail("Embed container not found on smoke page");
  }
  pass("Embed container present");

  const scriptMatch = pageHtml.match(/<script[^>]+src="([^"]*embed\.js[^"]*)"[^>]*data-podcast-id="([^"]+)"/i);
  if (!scriptMatch) {
    fail("Show Hub embed script tag with podcast id not found. Check NEXT_PUBLIC_SHOWHUB_PODCAST_ID.");
  }

  const embedScriptUrl = scriptMatch[1];
  const podcastId = scriptMatch[2];
  if (!podcastId || podcastId.includes("missing")) {
    fail("Podcast ID appears to be missing in embed script tag.");
  }
  pass(`Embed script configured for podcast id ${podcastId}`);

  const embedResponse = await fetch(embedScriptUrl);
  if (!embedResponse.ok) {
    fail(`Embed script request failed (${embedResponse.status}) for ${embedScriptUrl}`);
  }
  pass("Embed script is reachable");

  const apiUrl = new URL("/api/showhub-smoke", target.origin);
  const statusPayload = await fetchJson(apiUrl.toString());
  if (!statusPayload || statusPayload.ok !== true) {
    fail("Smoke status API did not return ok=true");
  }
  if (!statusPayload.configured) {
    fail("Smoke status API reports configured=false. Set NEXT_PUBLIC_SHOWHUB_PODCAST_ID.");
  }
  pass("Smoke status API reports configured=true");

  console.log("Show Hub smoke test completed successfully.");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : "Unknown smoke test error");
});
