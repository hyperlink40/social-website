import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LinkPreviewRequest {
  url: string;
}

interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image_url?: string;
  favicon_url?: string;
  domain?: string;
}

function extractDomain(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.hostname.replace("www.", "");
  } catch {
    return "";
  }
}

function extractOpenGraphData(html: string): Record<string, string> {
  const ogData: Record<string, string> = {};
  const ogRegex = /<meta\s+property="og:([^"]+)"\s+content="([^"]*)"/g;

  let match;
  while ((match = ogRegex.exec(html)) !== null) {
    ogData[`og_${match[1]}`] = match[2];
  }

  return ogData;
}

function extractTwitterCardData(html: string): Record<string, string> {
  const twitterData: Record<string, string> = {};
  const twitterRegex = /<meta\s+name="twitter:([^"]+)"\s+content="([^"]*)"/g;

  let match;
  while ((match = twitterRegex.exec(html)) !== null) {
    twitterData[`twitter_${match[1]}`] = match[2];
  }

  return twitterData;
}

function extractMetaTags(html: string): Record<string, string> {
  const metaTags: Record<string, string> = {};
  const metaRegex = /<meta\s+name="([^"]+)"\s+content="([^"]*)"/g;

  let match;
  while ((match = metaRegex.exec(html)) !== null) {
    metaTags[match[1]] = match[2];
  }

  return metaTags;
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : "";
}

function extractFaviconUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    return `${url.protocol}//${url.hostname}/favicon.ico`;
  } catch {
    return "";
  }
}

async function fetchPreview(urlString: string): Promise<LinkPreview> {
  const domain = extractDomain(urlString);

  try {
    const response = await fetch(urlString, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return { url: urlString, domain };
    }

    const html = await response.text();

    const ogData = extractOpenGraphData(html);
    const twitterData = extractTwitterCardData(html);
    const metaTags = extractMetaTags(html);

    const title =
      ogData["og_title"] ||
      twitterData["twitter_title"] ||
      metaTags["title"] ||
      extractTitle(html) ||
      domain;

    const description =
      ogData["og_description"] ||
      twitterData["twitter_description"] ||
      metaTags["description"] ||
      "";

    const imageUrl =
      ogData["og_image"] ||
      twitterData["twitter_image"] ||
      "";

    const faviconUrl = extractFaviconUrl(urlString);

    return {
      url: urlString,
      title: title.substring(0, 200),
      description: description.substring(0, 500),
      image_url: imageUrl || undefined,
      favicon_url: faviconUrl || undefined,
      domain,
    };
  } catch (error) {
    console.error(`Error fetching preview for ${urlString}:`, error);
    return { url: urlString, domain };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url } = (await req.json()) as LinkPreviewRequest;

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const preview = await fetchPreview(url);

    return new Response(JSON.stringify(preview), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to extract link preview",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
