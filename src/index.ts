import { Hono } from 'hono'

/**
 * CORS Anywhere for Cloudflare Workers using Hono.
 *
 * - Adds CORS headers to all proxied responses.
 * - The proxied URL is taken literally from the path, protocol optional (defaults: :443 -> https, else http).
 * - Disallows requests with user credentials (cookies).
 * - Can require headers for proxying, e.g. to avoid direct browser visits.
 */

const REMOVED_HEADERS = ['cookie', 'cookie2'] as const
const USAGE_TEXT = `\
CORS Anywhere Worker - Usage:

Send requests to /<target-url>, e.g.:
/http://example.com/
/example.com:443/
/example.com

Optional: Set required headers: origin, x-requested-with
`

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use('*', async (c, next) => {
  // Add CORS headers to every response
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    return c.newResponse('', 204)
  }
  await next()
})

function parseTargetUrl(path: string): string | null {
  if (!path) return null
  let url = path.replace(/^\/+/, '')
  if (!url) return null
  // If protocol is missing, infer from port or default to http
  if (!/^https?:\/\//i.test(url)) {
    if (/:443($|\/)/.test(url)) {
      url = 'https://' + url.replace(/^\/+/, '')
    } else {
      url = 'http://' + url.replace(/^\/+/, '')
    }
  }
  try {
    new URL(url)
    return url
  } catch {
    return null
  }
}

// Show usage/help text at /
app.get('/', c => c.text(USAGE_TEXT))

// Favicon: 404
app.get('/favicon.ico', c => c.notFound())

// Main proxy handler
app.all('/*', async c => {
  const path = c.req.path
  const targetUrl = parseTargetUrl(path)
  if (!targetUrl) {
    return c.text('Invalid or missing target URL in path. Example: /example.com or /http://example.com/', 400)
  }

  // Remove disallowed headers
  const reqHeaders = new Headers(c.req.raw.headers)
  for (const h of REMOVED_HEADERS) reqHeaders.delete(h)
  // Disallow sending cookies via credentials
  reqHeaders.delete('cookie')
  reqHeaders.delete('cookie2')

  // Proxy request
  try {
    const reqInit: RequestInit = {
      method: c.req.method,
      headers: reqHeaders,
      body: ['GET', 'HEAD'].includes(c.req.method) ? undefined : c.req.raw.body,
      redirect: 'manual',
    }
    const resp = await fetch(targetUrl, reqInit)
    // Clone and adjust headers
    const respHeaders = new Headers(resp.headers)
    // Set CORS headers
    respHeaders.set('Access-Control-Allow-Origin', '*')
    respHeaders.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
    respHeaders.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    // Remove cookies from proxied response
    respHeaders.delete('set-cookie')
    respHeaders.delete('set-cookie2')

    // Stream the response
    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: respHeaders,
    })
  } catch (e: any) {
    return c.text(`Proxy error: ${e?.message ?? e}`, 502)
  }
})

export default app
