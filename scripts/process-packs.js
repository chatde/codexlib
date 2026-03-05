#!/usr/bin/env node
/**
 * Process raw knowledge pack JSON files:
 * 1. Read all JSON files from seeds/ directory
 * 2. Compress each with TokenShrink
 * 3. Generate SQL INSERT statements
 * 4. Output to supabase/seed-packs.sql
 */

const fs = require('fs');
const path = require('path');
const { compress, countTokens } = require('tokenshrink');

const SEEDS_DIR = path.join(__dirname, '..', 'seeds');
const OUTPUT_FILE = path.join(__dirname, '..', 'supabase', 'seed-packs.sql');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function escapeSQL(str) {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  let packs;
  try {
    packs = JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse ${filePath}: ${e.message}`);
    return [];
  }

  if (!Array.isArray(packs)) {
    console.error(`${filePath} is not an array`);
    return [];
  }

  return packs.map((pack, idx) => {
    try {
      const result = compress(pack.content);
      const compressed = result.compressed;
      const rosetta = result.rosetta;
      const tokenCount = countTokens(compressed);
      const uncompressedTokens = countTokens(pack.content);
      const savingsPct = uncompressedTokens > 0
        ? ((1 - tokenCount / uncompressedTokens) * 100)
        : 0;

      return {
        slug: slugify(pack.title) + '-' + slugify(pack.domain).slice(0, 3) + idx.toString(36),
        title: pack.title,
        domain_slug: slugify(pack.domain),
        subdomain_slug: pack.subdomain ? slugify(pack.subdomain) : null,
        content_compressed: compressed,
        rosetta: rosetta,
        token_count: tokenCount,
        uncompressed_estimate: uncompressedTokens,
        savings_pct: Math.max(0, savingsPct).toFixed(1),
        difficulty: pack.difficulty || 'intermediate',
        is_free: pack.is_free || false,
        tags: pack.tags || [],
      };
    } catch (e) {
      console.error(`Failed to compress pack "${pack.title}": ${e.message}`);
      return null;
    }
  }).filter(Boolean);
}

function generateSQL(allPacks) {
  const lines = [
    '-- Auto-generated seed packs',
    `-- Generated: ${new Date().toISOString()}`,
    `-- Total packs: ${allPacks.length}`,
    '',
    '-- First, ensure tags exist',
  ];

  // Collect all unique tags
  const allTags = new Set();
  allPacks.forEach(p => (p.tags || []).forEach(t => allTags.add(t)));

  for (const tag of allTags) {
    lines.push(
      `INSERT INTO tags (name, slug) VALUES ('${escapeSQL(tag)}', '${escapeSQL(slugify(tag))}') ON CONFLICT (slug) DO NOTHING;`
    );
  }

  lines.push('', '-- Insert packs');

  for (const pack of allPacks) {
    const domainRef = `(SELECT id FROM domains WHERE slug = '${escapeSQL(pack.domain_slug)}')`;
    const subdomainRef = pack.subdomain_slug
      ? `(SELECT id FROM subdomains WHERE slug = '${escapeSQL(pack.subdomain_slug)}' AND domain_id = ${domainRef})`
      : 'NULL';

    lines.push(`INSERT INTO packs (slug, title, domain_id, subdomain_id, content_compressed, rosetta, token_count, uncompressed_estimate, savings_pct, difficulty, is_free, status) VALUES (
  '${escapeSQL(pack.slug)}',
  '${escapeSQL(pack.title)}',
  ${domainRef},
  ${subdomainRef},
  '${escapeSQL(pack.content_compressed)}',
  '${escapeSQL(pack.rosetta)}',
  ${pack.token_count},
  ${pack.uncompressed_estimate},
  ${pack.savings_pct},
  '${escapeSQL(pack.difficulty)}',
  ${pack.is_free},
  'approved'
) ON CONFLICT (slug) DO NOTHING;`);

    // Tag associations
    for (const tag of (pack.tags || [])) {
      lines.push(
        `INSERT INTO pack_tags (pack_id, tag_id) VALUES ((SELECT id FROM packs WHERE slug = '${escapeSQL(pack.slug)}'), (SELECT id FROM tags WHERE slug = '${escapeSQL(slugify(tag))}')) ON CONFLICT DO NOTHING;`
      );
    }

    lines.push('');
  }

  return lines.join('\n');
}

// Main
console.log('Processing knowledge packs...');

if (!fs.existsSync(SEEDS_DIR)) {
  console.error(`Seeds directory not found: ${SEEDS_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(SEEDS_DIR).filter(f => f.endsWith('.json'));
console.log(`Found ${files.length} seed files`);

let allPacks = [];
for (const file of files) {
  const filePath = path.join(SEEDS_DIR, file);
  console.log(`Processing ${file}...`);
  const packs = processFile(filePath);
  console.log(`  -> ${packs.length} packs compressed`);
  allPacks = allPacks.concat(packs);
}

console.log(`\nTotal: ${allPacks.length} packs`);

// Domain stats
const domainCounts = {};
allPacks.forEach(p => {
  domainCounts[p.domain_slug] = (domainCounts[p.domain_slug] || 0) + 1;
});
console.log('\nPacks per domain:');
Object.entries(domainCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([domain, count]) => console.log(`  ${domain}: ${count}`));

// Token stats
const totalTokens = allPacks.reduce((s, p) => s + p.token_count, 0);
const totalUncompressed = allPacks.reduce((s, p) => s + p.uncompressed_estimate, 0);
const avgSavings = totalUncompressed > 0
  ? ((1 - totalTokens / totalUncompressed) * 100).toFixed(1)
  : 0;
console.log(`\nTotal tokens: ${totalTokens.toLocaleString()}`);
console.log(`Uncompressed estimate: ${totalUncompressed.toLocaleString()}`);
console.log(`Average savings: ${avgSavings}%`);

const sql = generateSQL(allPacks);
fs.writeFileSync(OUTPUT_FILE, sql, 'utf-8');
console.log(`\nSQL written to ${OUTPUT_FILE}`);
console.log(`File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB`);
