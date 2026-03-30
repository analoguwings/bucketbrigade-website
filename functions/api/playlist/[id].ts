// GET /api/playlist/:id
// Returns stored playlist JSON for the given share ID.

interface Env {
  PLAYLISTS: KVNamespace
}

export const onRequest: PagesFunction<Env> = async ({ params, env, request }) => {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }
  const id = params.id as string

  if (!id || !/^[a-f0-9]{10}$/.test(id)) {
    return new Response('Invalid ID', { status: 400 })
  }

  const raw = await env.PLAYLISTS.get(id)
  if (!raw) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(raw, {
    headers: { 'Content-Type': 'application/json' },
  })
}
