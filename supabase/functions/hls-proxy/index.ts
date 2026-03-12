const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TV_STREAM_BASE = "http://tv.vtune.stream:8409";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Get the path from the query parameter
    const path = url.searchParams.get('path');
    
    if (!path) {
      return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only allow paths that look like HLS content
    if (!path.match(/^\/iptv\//) ) {
      return new Response(JSON.stringify({ error: 'Invalid path' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const targetUrl = `${TV_STREAM_BASE}${path}`;
    
    // Determine mode from original query params if present
    const mode = url.searchParams.get('mode');
    const fetchUrl = mode ? `${targetUrl}?mode=${mode}` : targetUrl;

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Upstream returned ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const body = await response.arrayBuffer();

    // For .m3u8 playlists, rewrite internal URLs to go through proxy
    if (path.endsWith('.m3u8') || contentType.includes('mpegurl')) {
      const text = new TextDecoder().decode(body);
      const proxyBase = `${url.origin}${url.pathname}`;
      
      // Rewrite relative .ts segment URLs and .m3u8 sub-playlist URLs
      const rewritten = text.replace(/^(?!#)(.+\.ts.*)$/gm, (match) => {
        // Handle both absolute and relative URLs
        const segmentPath = match.startsWith('/') ? match : `/iptv/channel/${match}`;
        return `${proxyBase}?path=${encodeURIComponent(segmentPath)}`;
      }).replace(/^(?!#)(.+\.m3u8.*)$/gm, (match) => {
        const subPath = match.startsWith('/') ? match : `/iptv/channel/${match}`;
        return `${proxyBase}?path=${encodeURIComponent(subPath)}`;
      });

      return new Response(rewritten, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Cache-Control': 'no-cache, no-store',
        },
      });
    }

    // For .ts segments, stream through directly
    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('HLS proxy error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error', details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
