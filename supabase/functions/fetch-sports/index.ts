import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SportsFetchRequest {
  endpoint: "sports" | "event";
  eventId?: string;
  include?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { endpoint, eventId, include = "scores" }: SportsFetchRequest = await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "endpoint is required ('sports' or 'event')" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (endpoint === "event" && !eventId) {
      return new Response(
        JSON.stringify({ error: "eventId is required for event endpoint" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const apiKey = Deno.env.get("RAPIDAPI_KEY");
    const apiHost = Deno.env.get("RAPIDAPI_HOST");

    if (!apiKey || !apiHost) {
      return new Response(
        JSON.stringify({
          error: "API credentials not configured",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let url: string;
    if (endpoint === "sports") {
      url = `https://${apiHost}/sports`;
    } else {
      url = `https://${apiHost}/events/${eventId}?include=${include}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: `API request failed: ${response.statusText}`,
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching sports data:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch sports data",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
