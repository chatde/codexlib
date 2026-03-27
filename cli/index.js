#!/usr/bin/env node

const API_BASE = 'https://codexlib.io/api/v1';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

async function getAllPacks() {
  let page = 1;
  let allPacks = [];
  while (true) {
    const data = await apiFetch(`/packs?limit=100&page=${page}`);
    allPacks.push(...data.data);
    if (page >= data.meta.pages) break;
    page++;
  }
  return allPacks;
}

function copyToClipboard(text) {
  const { execFileSync } = require('child_process');
  try {
    execFileSync('pbcopy', [], { input: text, stdio: ['pipe', 'ignore', 'ignore'] });
    return true;
  } catch {
    try {
      execFileSync('xclip', ['-selection', 'clipboard'], { input: text, stdio: ['pipe', 'ignore', 'ignore'] });
      return true;
    } catch {
      return false;
    }
  }
}

// ── Commands ─────────────────────────────────────────────────────────────────

async function cmdPull(target) {
  if (!target) {
    console.error('Usage: codexlib pull <domain|pack-slug>');
    process.exit(1);
  }

  // First, try fetching as a pack slug directly
  try {
    const pack = await apiFetch(`/packs/${encodeURIComponent(target)}`);
    if (pack && pack.id) {
      return outputPack(pack);
    }
  } catch {
    // Not a valid slug — try as domain name
  }

  // Treat as domain: fetch all packs, filter by domain, pick random
  const allPacks = await getAllPacks();
  const domainLower = target.toLowerCase();
  let matching = allPacks.filter(p => p.slug.toLowerCase().startsWith(domainLower + '-'));

  if (matching.length === 0) {
    // Try fuzzy: domain as substring of slug
    matching = allPacks.filter(p => p.slug.toLowerCase().includes(domainLower));
  }

  if (matching.length === 0) {
    console.error(`No packs found for "${target}".`);
    console.error('Run "codexlib list" to see available domains.');
    process.exit(1);
  }

  const pick = matching[Math.floor(Math.random() * matching.length)];
  const pack = await apiFetch(`/packs/${pick.slug}`);
  return outputPack(pack);
}

function outputPack(pack) {
  const output = [];
  if (pack.rosetta) {
    output.push(pack.rosetta);
    output.push('');
  }
  if (pack.content) {
    output.push(pack.content);
  }
  const text = output.join('\n');

  const copied = copyToClipboard(text);
  if (copied) {
    console.log(`Pulled "${pack.title}" (${pack.token_count} tokens, ${pack.savings_pct}% saved) → copied to clipboard`);
  } else {
    // Fallback: print to stdout
    console.log(text);
    console.error(`\n--- Pulled "${pack.title}" (${pack.token_count} tokens, ${pack.savings_pct}% saved) ---`);
  }
}

async function cmdSearch(query) {
  if (!query) {
    console.error('Usage: codexlib search <query>');
    process.exit(1);
  }

  // API search may not work, so do client-side filtering
  const allPacks = await getAllPacks();
  const q = query.toLowerCase();
  const results = allPacks.filter(p =>
    p.slug.toLowerCase().includes(q) ||
    p.title.toLowerCase().includes(q)
  );

  if (results.length === 0) {
    console.log(`No packs found for "${query}".`);
    return;
  }

  console.log(`Found ${results.length} pack(s):\n`);
  for (const p of results) {
    const free = p.is_free ? ' [FREE]' : '';
    console.log(`  ${p.slug}`);
    console.log(`    ${p.title} — ${p.token_count} tokens, ${p.savings_pct}% saved, ${p.difficulty}${free}`);
  }
}

async function cmdList(domain) {
  const allPacks = await getAllPacks();

  if (!domain) {
    // Group by slug prefix to derive domains
    const domainMap = new Map();
    for (const p of allPacks) {
      const parts = p.slug.split('-');
      let prefix = parts[0];
      // Detect two-word domain prefixes (ai-ml, data-science, etc.)
      if (parts.length > 2) {
        const twoWord = parts.slice(0, 2).join('-');
        const twoWordCount = allPacks.filter(pp => pp.slug.startsWith(twoWord + '-')).length;
        if (twoWordCount >= 2) prefix = twoWord;
      }
      if (!domainMap.has(prefix)) domainMap.set(prefix, []);
      domainMap.get(prefix).push(p);
    }

    console.log(`Domains (${domainMap.size}):\n`);
    const sorted = [...domainMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    for (const [dom, packs] of sorted) {
      console.log(`  ${dom} (${packs.length} pack${packs.length > 1 ? 's' : ''})`);
    }
    console.log(`\nTotal: ${allPacks.length} packs`);
    console.log('\nUsage: codexlib list <domain> — list packs in a domain');
    return;
  }

  // Filter packs by domain prefix
  const domainLower = domain.toLowerCase();
  let matching = allPacks.filter(p =>
    p.slug.toLowerCase().startsWith(domainLower + '-') ||
    p.slug.toLowerCase() === domainLower
  );

  if (matching.length === 0) {
    matching = allPacks.filter(p => p.slug.toLowerCase().includes(domainLower));
  }

  if (matching.length === 0) {
    console.error(`No packs found for domain "${domain}".`);
    process.exit(1);
  }

  console.log(`Packs in "${domain}" (${matching.length}):\n`);
  for (const p of matching) {
    const free = p.is_free ? ' [FREE]' : '';
    console.log(`  ${p.slug}`);
    console.log(`    ${p.title} — ${p.token_count} tokens, ${p.savings_pct}% saved${free}`);
  }
}

function showHelp() {
  console.log(`codexlib — Compressed knowledge packs for AI prompts

Usage:
  codexlib pull <domain>       Download a random pack from that domain to clipboard
  codexlib pull <pack-slug>    Download a specific pack to clipboard
  codexlib search <query>      Search packs by keyword
  codexlib list                List all domains
  codexlib list <domain>       List packs in a domain
  codexlib help                Show this help

Examples:
  codexlib pull ai-ml-llm-fundamentals
  codexlib pull cybersecurity
  codexlib search quantum
  codexlib list ai-ml
`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];
const target = args.slice(1).join(' ');

switch (command) {
  case 'pull':
    cmdPull(target).catch(err => { console.error('Error:', err.message); process.exit(1); });
    break;
  case 'search':
    cmdSearch(target).catch(err => { console.error('Error:', err.message); process.exit(1); });
    break;
  case 'list':
    cmdList(target || null).catch(err => { console.error('Error:', err.message); process.exit(1); });
    break;
  case 'help':
  case '--help':
  case '-h':
  case undefined:
    showHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
