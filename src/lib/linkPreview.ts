export interface LinkPreview {
  id: string;
  url: string;
  title?: string;
  description?: string;
  image_url?: string;
  favicon_url?: string;
  domain?: string;
  created_at: string;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) || [];
  const unique = new Set<string>();

  matches.forEach((url) => {
    // Remove trailing punctuation that's often not part of the URL
    const cleaned = url
      .replace(/[.,;:!?)]*$/, "")
      .replace(/[<>]*$/, "");

    if (isValidUrl(cleaned)) {
      unique.add(cleaned);
    }
  });

  return Array.from(unique);
}

export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getDomain(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.hostname.replace("www.", "");
  } catch {
    return "";
  }
}

export async function fetchLinkPreview(
  url: string
): Promise<LinkPreview | null> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const apiUrl = `${supabaseUrl}/functions/v1/extract-link-preview`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      console.error(`Failed to fetch preview for ${url}:`, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching link preview for ${url}:`, error);
    return null;
  }
}

export async function saveLinkPreview(
  supabase: any,
  preview: LinkPreview
): Promise<LinkPreview | null> {
  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from("link_previews")
      .select("*")
      .eq("url", preview.url)
      .maybeSingle();

    if (existing) {
      return existing;
    }

    // Insert new preview
    const { data, error } = await supabase
      .from("link_previews")
      .insert({
        url: preview.url,
        title: preview.title,
        description: preview.description,
        image_url: preview.image_url,
        favicon_url: preview.favicon_url,
        domain: preview.domain,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error saving link preview:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in saveLinkPreview:", error);
    return null;
  }
}

export async function linkPostWithPreview(
  supabase: any,
  postId: string,
  previewId: string,
  position: number = 0
): Promise<boolean> {
  try {
    const { error } = await supabase.from("post_links").insert({
      post_id: postId,
      link_preview_id: previewId,
      position,
    });

    if (error) {
      // Ignore duplicate key errors
      if (error.code !== "23505") {
        console.error("Error linking post with preview:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error in linkPostWithPreview:", error);
    return false;
  }
}
