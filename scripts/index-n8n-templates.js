/* eslint-disable no-console */
const fs = require("fs/promises");
const path = require("path");

const OWNER = "wassupjay";
const REPO = "n8n-free-templates";
const BRANCH = "main";
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;
const RAW_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "src", "data", "n8n-templates");
const OUTPUT_INDEX = path.join(PROJECT_ROOT, "src", "data", "n8n-templates-index.json");

const SERVICE_PATTERNS = [
  { id: "gmail", label: "Gmail", patterns: [/gmail/i] },
  { id: "outlook", label: "Outlook", patterns: [/outlook/i, /microsoftOutlook/i] },
  { id: "googleSheets", label: "Google Sheets", patterns: [/googleSheets/i] },
  { id: "slack", label: "Slack", patterns: [/slack/i] },
  { id: "discord", label: "Discord", patterns: [/discord/i] },
  { id: "notion", label: "Notion", patterns: [/notion/i] },
  { id: "airtable", label: "Airtable", patterns: [/airtable/i] },
  { id: "hubspot", label: "HubSpot", patterns: [/hubspot/i] },
  { id: "salesforce", label: "Salesforce", patterns: [/salesforce/i] },
  { id: "stripe", label: "Stripe", patterns: [/stripe/i] },
  { id: "postgres", label: "Postgres", patterns: [/postgres/i, /postgre/i] },
  { id: "mongodb", label: "MongoDB", patterns: [/mongodb/i] },
  { id: "redis", label: "Redis", patterns: [/redis/i] },
  { id: "pinecone", label: "Pinecone", patterns: [/pinecone/i] },
  { id: "openai", label: "OpenAI", patterns: [/openai/i] },
  { id: "openrouter", label: "OpenRouter", patterns: [/openrouter/i] },
  { id: "anthropic", label: "Anthropic", patterns: [/anthropic/i] },
  { id: "cohere", label: "Cohere", patterns: [/cohere/i] },
  { id: "telegram", label: "Telegram", patterns: [/telegram/i] },
  { id: "twilio", label: "Twilio", patterns: [/twilio/i] },
  { id: "webhook", label: "Webhook", patterns: [/webhook/i] },
];

async function requestJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "n8n-template-indexer",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

async function requestText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "n8n-template-indexer" },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.text();
}

function makeTemplateId(filePath) {
  return filePath.replace(/\.json$/i, "").replace(/[\/_]+/g, "-").toLowerCase();
}

function nodeIdToType(nodes) {
  const map = new Map();
  for (const node of nodes) {
    if (node?.id && node?.type) {
      map.set(String(node.id), String(node.type));
    }
  }
  return map;
}

function extractEdges(connections) {
  const edges = [];

  if (!connections || typeof connections !== "object") {
    return edges;
  }

  for (const [fromNodeName, outputGroups] of Object.entries(connections)) {
    if (!outputGroups || typeof outputGroups !== "object") continue;

    for (const outputs of Object.values(outputGroups)) {
      if (!Array.isArray(outputs)) continue;

      for (const branch of outputs) {
        if (!Array.isArray(branch)) continue;

        for (const link of branch) {
          const toNode = link?.node;
          if (!toNode) continue;
          edges.push({
            from: String(fromNodeName),
            to: String(toNode),
            type: String(link?.type || "main"),
          });
        }
      }
    }
  }

  return edges;
}

function detectServices(nodeTypes) {
  const detected = [];

  for (const service of SERVICE_PATTERNS) {
    const matches = nodeTypes.some((nodeType) =>
      service.patterns.some((pattern) => pattern.test(nodeType))
    );
    if (matches) {
      detected.push(service.id);
    }
  }

  return detected;
}

function hasProvider(nodeTypes, providerPatterns) {
  return nodeTypes.some((nodeType) =>
    providerPatterns.some((pattern) => pattern.test(nodeType))
  );
}

function buildTemplateMetadata(filePath, templateJson) {
  const category = filePath.split("/")[0];
  const slug = path.basename(filePath, ".json");
  const id = makeTemplateId(filePath);
  const rawUrl = `${RAW_BASE}/${filePath}`;
  const nodes = Array.isArray(templateJson?.nodes) ? templateJson.nodes : [];
  const graphNodes = nodes.filter((node) => node?.type !== "n8n-nodes-base.stickyNote");
  const nodeTypes = Array.from(
    new Set(
      graphNodes
        .map((node) => String(node?.type || ""))
        .filter(Boolean)
    )
  );
  const edges = extractEdges(templateJson?.connections);
  const services = detectServices(nodeTypes);

  return {
    id,
    name: String(templateJson?.name || slug.replace(/[_-]+/g, " ")),
    slug,
    category,
    filePath,
    rawUrl,
    localPath: `src/data/n8n-templates/${id}.json`,
    nodeCount: graphNodes.length,
    edgeCount: edges.length,
    nodeTypes,
    services,
    hasAI: hasProvider(nodeTypes, [/langchain/i, /openai/i, /openrouter/i, /anthropic/i, /cohere/i]),
    hasEmail: hasProvider(nodeTypes, [/gmail/i, /outlook/i, /mail/i, /imap/i, /smtp/i, /sendgrid/i]),
    hasVectorStore: hasProvider(nodeTypes, [/vectorStore/i, /pinecone/i, /weaviate/i, /qdrant/i]),
    nodes: graphNodes.map((node) => ({
      id: String(node?.id || ""),
      name: String(node?.name || "Unknown node"),
      type: String(node?.type || "unknown"),
      position: Array.isArray(node?.position) ? [Number(node.position[0] || 0), Number(node.position[1] || 0)] : [0, 0],
    })),
    connections: edges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      type: edge.type,
      fromType: nodeIdToType(graphNodes).get(edge.from) || "",
      toType: nodeIdToType(graphNodes).get(edge.to) || "",
    })),
  };
}

async function ensureOutputDirectory() {
  await fs.mkdir(path.dirname(OUTPUT_INDEX), { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function clearOutputDirectory() {
  const entries = await fs.readdir(OUTPUT_DIR);
  await Promise.all(
    entries
      .filter((entry) => entry.endsWith(".json"))
      .map((entry) => fs.unlink(path.join(OUTPUT_DIR, entry)))
  );
}

async function main() {
  console.log("Fetching template tree from GitHub...");
  const tree = await requestJson(`${API_BASE}/git/trees/${BRANCH}?recursive=1`);
  const jsonFiles = (tree.tree || [])
    .filter((entry) => entry?.type === "blob" && entry?.path?.endsWith(".json"))
    .filter((entry) => !entry.path.startsWith("."))
    .map((entry) => entry.path);

  console.log(`Found ${jsonFiles.length} template JSON files.`);

  await ensureOutputDirectory();
  await clearOutputDirectory();

  const metadataList = [];
  const failedFiles = [];
  const concurrency = 8;

  for (let i = 0; i < jsonFiles.length; i += concurrency) {
    const batch = jsonFiles.slice(i, i + concurrency);
    const resultBatch = await Promise.all(
      batch.map(async (filePath) => {
        try {
          const rawText = await requestText(`${RAW_BASE}/${filePath}`);
          const parsed = JSON.parse(rawText);
          const metadata = buildTemplateMetadata(filePath, parsed);
          const outputPath = path.join(OUTPUT_DIR, `${metadata.id}.json`);
          await fs.writeFile(outputPath, JSON.stringify(parsed, null, 2), "utf8");
          return metadata;
        } catch (error) {
          failedFiles.push({
            filePath,
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        }
      })
    );

    for (const metadata of resultBatch) {
      if (metadata) {
        metadataList.push(metadata);
      }
    }

    console.log(`Processed ${Math.min(i + concurrency, jsonFiles.length)}/${jsonFiles.length}`);
  }

  metadataList.sort((a, b) => a.name.localeCompare(b.name));
  const categories = Array.from(new Set(metadataList.map((item) => item.category))).sort();
  const services = Array.from(new Set(metadataList.flatMap((item) => item.services))).sort();

  const indexPayload = {
    generatedAt: new Date().toISOString(),
    source: {
      repo: `${OWNER}/${REPO}`,
      branch: BRANCH,
      treeApi: `${API_BASE}/git/trees/${BRANCH}?recursive=1`,
    },
    stats: {
      totalTemplates: metadataList.length,
      categories: categories.length,
      services: services.length,
    },
    categories,
    services,
    templates: metadataList,
  };

  await fs.writeFile(OUTPUT_INDEX, JSON.stringify(indexPayload, null, 2), "utf8");

  console.log(`Wrote ${OUTPUT_INDEX}`);
  console.log(`Wrote ${metadataList.length} template files to ${OUTPUT_DIR}`);

  if (failedFiles.length > 0) {
    console.log(`Failed files (${failedFiles.length}):`);
    for (const failed of failedFiles) {
      console.log(`- ${failed.filePath}: ${failed.error}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
