const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json().catch(() => ({ url: null }));
    if (!url || typeof url !== "string" || !/^https?:\/\//.test(url)) {
      return json({ error: "URL inválida" }, 400);
    }

    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        },
        redirect: "follow",
      });
    } catch (e) {
      return json({
        title: null, image: null, price: null,
        blocked: true,
        error: `Não foi possível acessar a página: ${String(e)}`,
      });
    }

    if (!res.ok) {
      return json({
        title: null, image: null, price: null,
        blocked: res.status === 403 || res.status === 429 || res.status === 503,
        error: `A Hotmart respondeu com status ${res.status}. A página pode estar bloqueando importação automática.`,
      });
    }

    const html = await res.text();

    const meta = (prop: string) => {
      const re1 = new RegExp(
        `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`,
        "i",
      );
      const re2 = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`,
        "i",
      );
      return html.match(re1)?.[1] ?? html.match(re2)?.[1] ?? null;
    };

    const title =
      meta("og:title") ||
      meta("twitter:title") ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      null;
    const image = meta("og:image") || meta("twitter:image");

    let price: number | null = null;
    const priceMeta =
      meta("product:price:amount") ||
      meta("og:price:amount") ||
      meta("twitter:data1");
    if (priceMeta) {
      const n = parseFloat(priceMeta.replace(",", ".").replace(/[^\d.]/g, ""));
      if (!isNaN(n)) price = n;
    }
    if (price === null) {
      const m = html.match(/R\$\s*([\d.]+,\d{2})/);
      if (m) {
        const n = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
        if (!isNaN(n)) price = n;
      }
    }

    return json({
      title: title?.trim() ?? null,
      image: image?.trim() ?? null,
      price,
    });
  } catch (e) {
    return json({ title: null, image: null, price: null, error: String(e) }, 200);
  }
});
