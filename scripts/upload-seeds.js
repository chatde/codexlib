#!/usr/bin/env node
/**
 * Upload seed knowledge packs to Supabase.
 *
 * Reads individual JSON files from seeds/packs/,
 * resolves domain IDs from slugs, and inserts into the packs table.
 *
 * Usage: node scripts/upload-seeds.js
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx > 0) {
    env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const PACKS_DIR = path.join(__dirname, '..', 'seeds', 'packs');

async function main() {
  const files = fs.readdirSync(PACKS_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} seed pack files\n`);

  // Cache domain lookups
  const domainCache = {};

  let success = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(PACKS_DIR, file);
    let pack;
    try {
      pack = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error(`  SKIP ${file}: invalid JSON — ${e.message}`);
      failed++;
      continue;
    }

    // Resolve domain_id
    if (!domainCache[pack.domain_slug]) {
      const { data: domain, error } = await supabase
        .from('domains')
        .select('id')
        .eq('slug', pack.domain_slug)
        .single();

      if (error || !domain) {
        console.error(`  SKIP ${file}: domain "${pack.domain_slug}" not found`);
        failed++;
        continue;
      }
      domainCache[pack.domain_slug] = domain.id;
    }
    const domainId = domainCache[pack.domain_slug];

    // Resolve subdomain_id (optional)
    let subdomainId = null;
    if (pack.subdomain_slug) {
      const { data: sub } = await supabase
        .from('subdomains')
        .select('id')
        .eq('slug', pack.subdomain_slug)
        .eq('domain_id', domainId)
        .single();
      subdomainId = sub?.id ?? null;
    }

    // Insert pack
    const { error: insertError } = await supabase.from('packs').upsert({
      slug: pack.slug,
      title: pack.title,
      domain_id: domainId,
      subdomain_id: subdomainId,
      difficulty: pack.difficulty || 'intermediate',
      content_compressed: pack.content_compressed,
      rosetta: pack.rosetta || '',
      token_count: pack.token_count || 0,
      uncompressed_estimate: pack.uncompressed_estimate || 0,
      savings_pct: pack.savings_pct || 0,
      status: 'approved',
      is_free: pack.is_free ?? false,
    }, { onConflict: 'slug' });

    if (insertError) {
      console.error(`  FAIL ${pack.title}: ${insertError.message}`);
      failed++;
    } else {
      console.log(`  OK   ${pack.title} (${pack.domain_slug}, ${pack.difficulty}, ${pack.is_free ? 'FREE' : 'paid'})`);
      success++;
    }

    // Insert tags if present
    if (pack.tags && pack.tags.length > 0) {
      for (const tagName of pack.tags) {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Upsert tag
        await supabase.from('tags').upsert({ name: tagName, slug: tagSlug }, { onConflict: 'slug' });

        // Link pack to tag
        const { data: packRow } = await supabase.from('packs').select('id').eq('slug', pack.slug).single();
        const { data: tagRow } = await supabase.from('tags').select('id').eq('slug', tagSlug).single();
        if (packRow && tagRow) {
          await supabase.from('pack_tags').upsert(
            { pack_id: packRow.id, tag_id: tagRow.id },
            { onConflict: 'pack_id,tag_id' }
          );
        }
      }
    }
  }

  console.log(`\nDone: ${success} uploaded, ${failed} failed`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
