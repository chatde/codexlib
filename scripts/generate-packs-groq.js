#!/usr/bin/env node
/**
 * Mass knowledge pack generator using Groq (Llama 3.3 70B).
 *
 * Generates deep knowledge packs for domains that need more content,
 * then uploads them directly to Supabase.
 *
 * Usage: node scripts/generate-packs-groq.js [--count N] [--domain slug]
 *
 * Defaults: generates 3 packs per domain for all domains with < 3 packs.
 * Set --count to control packs per domain. Set --domain for a specific one.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i > 0) env[t.slice(0, i)] = t.slice(i + 1);
}

// Load Groq key from jarvis .env
const jarvisEnv = fs.readFileSync('/Volumes/AI-Models/jarvis-bot/.env', 'utf-8');
let GROQ_KEY = '';
for (const line of jarvisEnv.split('\n')) {
  if (line.startsWith('GROQ_API_KEY=')) GROQ_KEY = line.slice('GROQ_API_KEY='.length).trim();
}

if (!GROQ_KEY) { console.error('Missing GROQ_API_KEY'); process.exit(1); }

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Parse args
const args = process.argv.slice(2);
let targetCount = 3;
let targetDomain = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--count' && args[i+1]) targetCount = parseInt(args[i+1]);
  if (args[i] === '--domain' && args[i+1]) targetDomain = args[i+1];
}

const TOPICS_PER_DOMAIN = {
  'agriculture': ['Soil Science & Crop Rotation', 'Precision Agriculture & Drone Farming', 'Livestock Management & Animal Husbandry'],
  'architecture': ['Sustainable Architecture & Green Building', 'Interior Design Principles', 'Structural Engineering for Architects'],
  'art-design': ['Digital Illustration & Vector Graphics', 'Color Theory & Typography', 'UX/UI Design Fundamentals'],
  'astronomy': ['Exoplanet Detection & Characterization', 'Cosmology & Dark Matter', 'Radio Astronomy & Signal Processing'],
  'aviation': ['Air Traffic Control Systems', 'Aircraft Maintenance & Inspection', 'Unmanned Aerial Systems (Drones)'],
  'biology': ['Evolutionary Biology & Natural Selection', 'Marine Biology & Oceanography', 'Microbiology & Virology'],
  'blockchain': ['DeFi Protocols & Yield Farming', 'Zero-Knowledge Proofs', 'Blockchain Scalability Solutions'],
  'business': ['Supply Chain Management', 'Venture Capital & Startup Funding', 'Business Intelligence & Analytics'],
  'chemistry': ['Organic Synthesis & Reaction Mechanisms', 'Analytical Chemistry & Spectroscopy', 'Biochemistry & Enzymology'],
  'computer-science': ['Operating Systems & Kernel Design', 'Distributed Systems & Consensus', 'Compiler Design & Language Theory'],
  'culinary': ['Pastry & Baking Science', 'Fermentation & Preservation', 'World Cuisines & Flavor Pairing'],
  'cybersecurity': ['Digital Forensics & Incident Response', 'Cryptography & PKI', 'Cloud Security Architecture'],
  'data-science': ['Time Series Analysis & Forecasting', 'Natural Language Processing Pipelines', 'Feature Engineering & Model Selection'],
  'dentistry': ['Orthodontics & Dental Implants', 'Endodontics & Root Canal Therapy'],
  'education': ['Special Education & Learning Disabilities', 'EdTech & Digital Learning Platforms'],
  'energy': ['Solar & Wind Energy Systems', 'Nuclear Energy & Reactor Design', 'Energy Storage & Battery Technology'],
  'engineering': ['Fluid Dynamics & Thermodynamics', 'Materials Science & Metallurgy', 'Control Systems & Automation'],
  'environmental-science': ['Water Treatment & Purification', 'Wildlife Conservation & Biodiversity'],
  'fashion': ['Sustainable Fashion & Circular Economy', 'Fashion Business & Merchandising'],
  'film-media': ['Documentary Filmmaking', 'Visual Effects & Post-Production'],
  'finance': ['Quantitative Finance & Risk Management', 'Personal Financial Planning', 'Corporate Finance & M&A'],
  'geography': ['GIS & Remote Sensing', 'Urban Planning & Smart Cities'],
  'healthcare': ['Telemedicine & Digital Health', 'Health Informatics & EHR Systems'],
  'history': ['Ancient Civilizations & Archaeology', 'Modern Geopolitics & International Relations'],
  'hospitality': ['Restaurant Management & Food Service', 'Tourism & Destination Marketing'],
  'journalism': ['Data Journalism & Visualization', 'Broadcast Journalism & Media Ethics'],
  'law': ['Intellectual Property Law', 'International Law & Human Rights', 'Corporate Law & Compliance'],
  'linguistics': ['Computational Linguistics & NLP', 'Sociolinguistics & Language Policy'],
  'manufacturing': ['Lean Manufacturing & Six Sigma', 'Additive Manufacturing (3D Printing)'],
  'maritime': ['Marine Engineering & Ship Design', 'Maritime Law & Regulations'],
  'mathematics': ['Linear Algebra & Matrix Theory', 'Probability & Statistical Inference', 'Number Theory & Cryptography'],
  'medicine': ['Radiology & Medical Imaging', 'Emergency Medicine & Trauma', 'Oncology & Cancer Biology'],
  'military-science': ['Cybersecurity in Military Operations', 'Intelligence Analysis & OSINT'],
  'music': ['Music Production & Audio Engineering', 'Music Business & Copyright'],
  'nursing': ['Critical Care Nursing', 'Community Health & Public Health Nursing'],
  'pharmacy': ['Clinical Pharmacology & Drug Development', 'Pharmaceutical Chemistry'],
  'philosophy': ['Philosophy of Mind & Consciousness', 'Political Philosophy & Justice'],
  'physics': ['Astrophysics & Stellar Evolution', 'Condensed Matter Physics', 'Particle Physics & Standard Model'],
  'political-science': ['Electoral Systems & Voting Theory', 'Public Policy Analysis'],
  'psychology': ['Neuropsychology & Brain Science', 'Developmental Psychology'],
  'quantum-computing': ['Quantum Error Correction', 'Quantum Machine Learning'],
  'real-estate': ['Commercial Real Estate & REITs', 'Property Valuation & Appraisal'],
  'robotics': ['Computer Vision for Robotics', 'Human-Robot Interaction'],
  'social-work': ['Child Welfare & Protection', 'Substance Abuse Counseling'],
  'sociology': ['Criminology & Criminal Justice', 'Media Studies & Digital Culture'],
  'sports-science': ['Sports Nutrition & Performance', 'Sports Psychology & Mental Training'],
  'telecommunications': ['5G & Next-Gen Networks', 'Fiber Optics & Photonics'],
  'transportation': ['Electric Vehicles & Charging Infrastructure', 'Supply Chain Logistics & Optimization'],
  'veterinary': ['Veterinary Emergency & Critical Care', 'Animal Behavior & Ethology'],
  'ai-ml': ['Computer Vision & Image Recognition', 'Reinforcement Learning & Game AI', 'Prompt Engineering & LLM Optimization'],
};

const SYSTEM_PROMPT = `You are a knowledge pack generator for CodexLib, an AI knowledge repository. Generate a compressed, information-dense knowledge pack on the given topic.

FORMAT REQUIREMENTS:
1. Use abbreviations with a Rosetta decoder (e.g., ML=Machine Learning, NN=Neural Network)
2. Write in compressed, technical prose — NOT conversational
3. Cover: fundamentals, key concepts, practical applications, current state of the art, common pitfalls
4. Aim for ~3000 tokens of compressed content
5. Include 10-25 abbreviations in the Rosetta decoder
6. Categorize difficulty as: beginner, intermediate, advanced, or expert

OUTPUT AS VALID JSON with these exact fields:
{
  "title": "Pack Title",
  "difficulty": "intermediate",
  "content_compressed": "The full compressed knowledge content...",
  "rosetta": "ABBR1=Full Term 1,ABBR2=Full Term 2,...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

IMPORTANT: Output ONLY the JSON object, no markdown, no explanation.`;

async function generatePack(topic, domainSlug) {
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate a deep knowledge pack on: "${topic}" for the "${domainSlug}" domain.` },
      ],
      max_tokens: 8000,
      temperature: 0.7,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Groq API error ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  const text = data.choices[0].message.content.trim();

  // Extract JSON from response (handle potential markdown wrapping)
  let jsonStr = text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];

  return JSON.parse(jsonStr);
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

async function main() {
  // Get domains that need more packs
  const { data: domains } = await supabase.from('domains').select('id, name, slug');

  // Get current pack counts per domain
  const { data: packs } = await supabase.from('packs').select('domain_id, slug');
  const packCounts = {};
  const existingSlugs = new Set();
  for (const p of packs || []) {
    packCounts[p.domain_id] = (packCounts[p.domain_id] || 0) + 1;
    existingSlugs.add(p.slug);
  }

  // Filter domains
  let targetDomains = domains.filter(d => {
    if (targetDomain) return d.slug === targetDomain;
    return (packCounts[d.id] || 0) < targetCount;
  });

  console.log(`\nGenerating packs for ${targetDomains.length} domains (target: ${targetCount} per domain)\n`);

  let generated = 0;
  let failed = 0;
  const startTime = Date.now();

  for (const domain of targetDomains) {
    const currentCount = packCounts[domain.id] || 0;
    const needed = targetCount - currentCount;
    if (needed <= 0) continue;

    const topics = TOPICS_PER_DOMAIN[domain.slug] || [];
    if (topics.length === 0) {
      console.log(`  SKIP ${domain.name}: no topics defined`);
      continue;
    }

    for (let i = 0; i < Math.min(needed, topics.length); i++) {
      const topic = topics[i];
      const slug = slugify(topic);

      if (existingSlugs.has(slug)) {
        console.log(`  SKIP ${topic}: already exists`);
        continue;
      }

      try {
        console.log(`  GEN  ${domain.name} > ${topic}...`);
        const pack = await generatePack(topic, domain.slug);

        // Estimate token savings
        const tokenCount = Math.round(pack.content_compressed.length / 4);
        const uncompressed = Math.round(tokenCount * 1.15);
        const savings = Math.round((1 - tokenCount / uncompressed) * 100 * 10) / 10;

        // Upload to Supabase
        const { error } = await supabase.from('packs').upsert({
          slug: slug,
          title: pack.title || topic,
          domain_id: domain.id,
          difficulty: pack.difficulty || 'intermediate',
          content_compressed: pack.content_compressed,
          rosetta: pack.rosetta || '',
          token_count: tokenCount,
          uncompressed_estimate: uncompressed,
          savings_pct: savings,
          status: 'approved',
          is_free: Math.random() < 0.15, // ~15% free
        }, { onConflict: 'slug' });

        if (error) {
          console.log(`  FAIL ${topic}: ${error.message}`);
          failed++;
        } else {
          console.log(`  OK   ${pack.title} (${tokenCount} tokens, ${savings}% saved)`);
          generated++;
          existingSlugs.add(slug);
        }

        // Insert tags
        if (pack.tags && pack.tags.length > 0) {
          for (const tagName of pack.tags.slice(0, 5)) {
            const tagSlug = slugify(tagName);
            await supabase.from('tags').upsert({ name: tagName, slug: tagSlug }, { onConflict: 'slug' });
            const { data: packRow } = await supabase.from('packs').select('id').eq('slug', slug).single();
            const { data: tagRow } = await supabase.from('tags').select('id').eq('slug', tagSlug).single();
            if (packRow && tagRow) {
              await supabase.from('pack_tags').upsert(
                { pack_id: packRow.id, tag_id: tagRow.id },
                { onConflict: 'pack_id,tag_id' }
              );
            }
          }
        }

        // Rate limit: Groq free tier = 30 req/min, be conservative
        await new Promise(r => setTimeout(r, 2500));

      } catch (err) {
        console.log(`  FAIL ${topic}: ${err.message}`);
        failed++;
        // If rate limited, wait longer
        if (err.message.includes('429')) {
          console.log('  ... rate limited, waiting 60s');
          await new Promise(r => setTimeout(r, 60000));
        }
      }
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\nDone in ${elapsed}s: ${generated} generated, ${failed} failed`);
  console.log(`Total packs now: ${55 + generated}`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
