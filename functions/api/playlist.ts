// POST /api/playlist
// Creates a new shared playlist record in KV and returns its short ID.

interface Env {
  PLAYLISTS: KVNamespace
}

interface CreateBody {
  name?: string
  identifiers?: string[]
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }
  let body: CreateBody
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0 || body.name.length > 200) {
    return new Response('Invalid name', { status: 400 })
  }
  if (!Array.isArray(body.identifiers) || body.identifiers.length === 0 || body.identifiers.length > 500) {
    return new Response('identifiers must be a non-empty array of up to 500 items', { status: 400 })
  }

  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 10)
  const value = JSON.stringify({
    name: body.name.trim(),
    identifiers: body.identifiers,
    createdAt: new Date().toISOString(),
  })

  // Store for 1 year
  await env.PLAYLISTS.put(id, value, { expirationTtl: 60 * 60 * 24 * 365 })

  return Response.json({ id })
}
