import https from 'https';

async function audit() {
  const url = 'https://kriatech.in';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (KRIA-SEO-Auditor)' } });
  const html = await res.text();
  
  console.log('HTTP Status:', res.status);
  console.log('HTML Length:', html.length);

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  console.log('\n--- HEAD METADATA ---');
  console.log('Title:', titleMatch ? titleMatch[1] : 'MISSING');
  
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  console.log('Meta Description:', descMatch ? descMatch[1] : 'MISSING');

  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  console.log('Canonical:', canonicalMatch ? canonicalMatch[1] : 'MISSING');

  const gscMatch = html.match(/<meta\s+name=["']google-site-verification["']\s+content=["']([^"']+)["']/i);
  console.log('GSC Verification Tag:', gscMatch ? gscMatch[1] : 'MISSING');

  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  console.log('OG Title:', ogTitleMatch ? ogTitleMatch[1] : 'MISSING');

  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  console.log('OG Image:', ogImageMatch ? ogImageMatch[1] : 'MISSING');

  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
  console.log('OG Description:', ogDescMatch ? ogDescMatch[1] : 'MISSING');

  console.log('\n--- STRUCTURED DATA (JSON-LD) ---');
  const scripts = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  console.log('Count of JSON-LD scripts:', scripts.length);
  scripts.forEach((s, idx) => {
    try {
      const parsed = JSON.parse(s[1]);
      console.log(`Script #${idx + 1}: Valid JSON.`);
      if (parsed['@graph']) {
        console.log(`  Graph items (${parsed['@graph'].length}):`, parsed['@graph'].map(i => i['@type']));
      } else {
        console.log('  Type:', parsed['@type']);
      }
    } catch(err) {
      console.error(`Script #${idx + 1}: PARSE ERROR:`, err.message);
    }
  });

  console.log('\n--- ON-PAGE HEADINGS ---');
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('H1 elements found:', h1s.length, h1s);

  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('H2 elements found:', h2s.length, h2s.slice(0, 5));

  console.log('\n--- SITEMAP & ROBOTS CHECK ---');
  const sitemapRes = await fetch('https://kriatech.in/sitemap.xml');
  console.log('Sitemap status:', sitemapRes.status, 'size:', (await sitemapRes.text()).length, 'bytes');

  const robotsRes = await fetch('https://kriatech.in/robots.txt');
  const robotsTxt = await robotsRes.text();
  console.log('Robots.txt status:', robotsRes.status);
  console.log('Robots.txt body:\n' + robotsTxt);
}

audit();
