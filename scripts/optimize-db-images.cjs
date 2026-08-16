const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const supabaseUrl = 'https://goiaovxlfbacutaupeeu.supabase.co';
const supabaseKey = 'sb_publishable_juO5Mgzyb34CPutvZNrSDA_qKemuk82';
const supabase = createClient(supabaseUrl, supabaseKey);

async function compressBase64(dataUrl, maxDimension = 1200, quality = 80) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  // If already small (< 150 KB), skip
  if (dataUrl.length < 200000) {
    return dataUrl;
  }

  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return dataUrl;
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const optimizedBuffer = await sharp(buffer)
      .resize({
        width: maxDimension,
        height: maxDimension,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality, progressive: true })
      .toBuffer();

    const newBase64 = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;
    console.log(`  [Compressed] Original size: ${(dataUrl.length / 1024).toFixed(1)} KB -> New size: ${(newBase64.length / 1024).toFixed(1)} KB (Saved ${(((dataUrl.length - newBase64.length) / dataUrl.length) * 100).toFixed(1)}%)`);
    return newBase64;
  } catch (err) {
    console.error('  [Compression Error]', err.message);
    return dataUrl;
  }
}

async function runOptimization() {
  console.log('🚀 Starting Database Image Optimization for SocioDex...');

  // 1. Optimize memory_pages
  console.log('\n--- Checking memory_pages ---');
  const { data: pages, error: pageErr } = await supabase.from('memory_pages').select('*');
  if (pageErr) {
    console.error('Error fetching pages:', pageErr);
    return;
  }

  console.log(`Found ${pages.length} memory pages.`);
  for (const page of pages) {
    if (page.image_urls && page.image_urls.length > 0) {
      let changed = false;
      const optimizedImages = [];
      console.log(`\nPage: ${page.slug} (${page.recipient}) - ${page.image_urls.length} images`);
      for (const img of page.image_urls) {
        const compressed = await compressBase64(img);
        if (compressed !== img) changed = true;
        optimizedImages.push(compressed);
      }

      if (changed) {
        console.log(`  Updating memory_page ${page.slug}...`);
        const { error: updateErr } = await supabase
          .from('memory_pages')
          .update({ image_urls: optimizedImages })
          .eq('id', page.id);

        if (updateErr) {
          console.error(`  Failed to update page ${page.slug}:`, updateErr.message);
        } else {
          console.log(`  ✅ Successfully updated ${page.slug}!`);
        }
      } else {
        console.log(`  Page ${page.slug} images are already optimized.`);
      }
    }
  }

  // 2. Optimize contributions
  console.log('\n--- Checking contributions ---');
  const { data: contribs, error: contribErr } = await supabase.from('contributions').select('*');
  if (contribErr) {
    console.error('Error fetching contributions:', contribErr);
    return;
  }

  console.log(`Found ${contribs.length} contributions.`);
  for (const c of contribs) {
    if (c.media_urls && c.media_urls.length > 0) {
      let changed = false;
      const optimizedMedia = [];
      console.log(`\nContribution by ${c.contributor_name} (${c.type}) - ${c.media_urls.length} media items`);
      for (const media of c.media_urls) {
        const compressed = await compressBase64(media);
        if (compressed !== media) changed = true;
        optimizedMedia.push(compressed);
      }

      if (changed) {
        console.log(`  Updating contribution ${c.id}...`);
        const { error: updateErr } = await supabase
          .from('contributions')
          .update({ media_urls: optimizedMedia })
          .eq('id', c.id);

        if (updateErr) {
          console.error(`  Failed to update contribution ${c.id}:`, updateErr.message);
        } else {
          console.log(`  ✅ Successfully updated contribution ${c.id}!`);
        }
      } else {
        console.log(`  Contribution ${c.id} media is already optimized.`);
      }
    }
  }

  console.log('\n🎉 Database Image Optimization Complete!');
}

runOptimization();
