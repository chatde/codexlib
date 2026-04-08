#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('/Volumes/AI-Models/codexlib/.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx > 0) env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const missingDomains = [
  { slug: 'religion', name: 'Religion', description: 'World religions, theology, spiritual traditions', icon: '🕊️' },
  { slug: 'christianity', name: 'Christianity', description: 'Christian theology, history, and practice', icon: '✝️' },
  { slug: 'islam', name: 'Islam', description: 'Islamic theology, jurisprudence, and history', icon: '☪️' },
  { slug: 'buddhism', name: 'Buddhism', description: 'Buddhist philosophy, practice, and history', icon: '☸️' },
  { slug: 'hinduism', name: 'Hinduism', description: 'Hindu philosophy, texts, and traditions', icon: '🕉️' },
  { slug: 'judaism', name: 'Judaism', description: 'Jewish theology, law, and history', icon: '✡️' },
  { slug: 'literature', name: 'Literature', description: 'Classic and modern literary works and analysis', icon: '📖' },
  { slug: 'sikhism', name: 'Sikhism', description: 'Sikh philosophy, history, and practice', icon: '🪯' },
  { slug: 'taoism', name: 'Taoism', description: 'Taoist philosophy and practice', icon: '☯️' },
  { slug: 'zoroastrianism', name: 'Zoroastrianism', description: 'Zoroastrian theology and traditions', icon: '🔥' },
  { slug: 'confucianism', name: 'Confucianism', description: 'Confucian ethics and philosophy', icon: '🎋' },
  { slug: 'jainism', name: 'Jainism', description: 'Jain philosophy and ethics', icon: '🌸' },
  { slug: 'shintoism', name: 'Shintoism', description: 'Shinto beliefs and practices', icon: '⛩️' },
  { slug: 'bahai', name: 'Bahai', description: 'Bahai faith, history, and teachings', icon: '🌟' },
  { slug: 'indigenous', name: 'Indigenous Spirituality', description: 'Indigenous spiritual traditions worldwide', icon: '🌿' },
  { slug: 'interfaith', name: 'Interfaith Studies', description: 'Comparative religion and interfaith dialogue', icon: '🤝' },
  { slug: 'comparative', name: 'Comparative Religion', description: 'Cross-cultural religious studies', icon: '🔍' },
  { slug: 'quantum', name: 'Quantum Science', description: 'Quantum physics, computing, and technologies', icon: '⚛️' },
  { slug: 'synthetic', name: 'Synthetic Biology', description: 'Engineering biological systems', icon: '🧬' },
  { slug: 'cryogenic', name: 'Cryogenic Science', description: 'Low-temperature physics and applications', icon: '❄️' },
  { slug: 'neuromorphic', name: 'Neuromorphic Computing', description: 'Brain-inspired computing architectures', icon: '🧠' },
  { slug: 'metamaterial', name: 'Metamaterials', description: 'Engineered materials with exotic properties', icon: '🔮' },
  { slug: 'photonics', name: 'Photonics', description: 'Light-based technologies and applications', icon: '💡' },
  { slug: 'spintronics', name: 'Spintronics', description: 'Electron spin-based electronics', icon: '🌀' },
  { slug: 'astrobiology', name: 'Astrobiology', description: 'Life in the universe and its origins', icon: '🔭' },
  { slug: 'fusion-energy', name: 'Fusion Energy', description: 'Nuclear fusion research and technology', icon: '☀️' },
  { slug: 'bioprinting', name: 'Bioprinting', description: '3D printing of biological tissues', icon: '🖨️' },
  { slug: 'geology', name: 'Geology', description: 'Earth sciences, mineralogy, and tectonics', icon: '🪨' },
  { slug: 'neuroscience', name: 'Neuroscience', description: 'Brain science and neural systems', icon: '🔬' },
  { slug: 'nutrition', name: 'Nutrition', description: 'Dietary science and human metabolism', icon: '🥗' },
  { slug: 'botany', name: 'Botany', description: 'Plant science and biology', icon: '🌱' },
  { slug: 'zoology', name: 'Zoology', description: 'Animal biology and behavior', icon: '🦁' },
  { slug: 'microbiology', name: 'Microbiology', description: 'Microscopic organisms and their roles', icon: '🦠' },
  { slug: 'epidemiology', name: 'Epidemiology', description: 'Disease patterns, causes, and effects', icon: '📊' },
  { slug: 'forensic', name: 'Forensic Science', description: 'Scientific methods in criminal investigation', icon: '🔬' },
  { slug: 'paleontology', name: 'Paleontology', description: 'Fossils and prehistoric life', icon: '🦕' },
  { slug: 'software-engineering', name: 'Software Engineering', description: 'Development practices and methodologies', icon: '💻' },
];

async function main() {
  let added = 0;
  for (const domain of missingDomains) {
    const { error } = await supabase.from('domains').upsert(domain, { onConflict: 'slug' });
    if (error) {
      console.error('  FAIL ' + domain.slug + ': ' + error.message);
    } else {
      console.log('  OK   ' + domain.slug);
      added++;
    }
  }
  console.log('\nDone: ' + added + ' domains added/updated');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
