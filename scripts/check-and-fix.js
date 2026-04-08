const fs = require('fs');
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

async function main() {
  // Count total packs
  const { count: total } = await supabase.from('packs').select('*', { count: 'exact', head: true });
  console.log('Total packs in DB: ' + total);

  // Count free packs
  const { count: freePacks } = await supabase.from('packs').select('*', { count: 'exact', head: true }).eq('is_free', true);
  console.log('Free packs: ' + freePacks);

  // Mark first pack in each domain as free using raw SQL via RPC if possible
  // Instead, get all domain_ids and for each, mark the oldest pack as free
  const { data: domains } = await supabase.from('domains').select('id, slug');
  console.log('Total domains: ' + domains.length);

  let markedFree = 0;
  for (const domain of domains) {
    const { data: packs } = await supabase
      .from('packs')
      .select('id, title')
      .eq('domain_id', domain.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
      .limit(3);

    if (packs && packs.length > 0) {
      for (const pack of packs) {
        const { error } = await supabase.from('packs').update({ is_free: true }).eq('id', pack.id);
        if (!error) {
          markedFree++;
        }
      }
    }
  }
  console.log('Marked ' + markedFree + ' packs as free (up to 3 per domain)');

  // Verify final free count
  const { count: finalFree } = await supabase.from('packs').select('*', { count: 'exact', head: true }).eq('is_free', true);
  console.log('Final free pack count: ' + finalFree);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
