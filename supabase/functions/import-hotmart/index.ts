import { corsHeaders } from '@supabase/supabase-js/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string' || !/^https?:\/\//.test(url)) {
      return new Response(JSON.stringify({ error: 'URL inválida' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; RaffafeBot/1.0; +https://raffafe-arte-digital.lovable.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ title: null, image: null, price: null, partial: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const html = await res.text();

    const meta = (prop: string) => {
      const re = new RegExp(
        `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`,
        'i',
      );
      const m = html.match(re);
      if (m) return m[1];
      const re2 = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`,
        'i',
      );
      const m2 = html.match(re2);
      return m2 ? m2[1] : null;
    };

    const title =
      meta('og:title') ||
      meta('twitter:title') ||
      (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? null);

    const image = meta('og:image') || meta('twitter:image');

    let price: number | null = null;
    const priceMeta =
      meta('product:price:amount') ||
      meta('og:price:amount') ||
      meta('twitter:data1');
    if (priceMeta) {
      const n = parseFloat(priceMeta.replace(',', '.').replace(/[^\d.]/g, ''));
      if (!isNaN(n)) price = n;
    }
    if (price === null) {
      const m = html.match(/R\$\s*([\d.]+,\d{2})/);
      if (m) {
        const n = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
        if (!isNaN(n)) price = n;
      }
    }

    return new Response(
      JSON.stringify({
        title: title?.trim() ?? null,
        image: image?.trim() ?? null,
        price,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ title: null, image: null, price: null, error: String(e) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
