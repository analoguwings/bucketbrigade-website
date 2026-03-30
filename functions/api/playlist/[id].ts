// GET /api/playlist/:id
// Returns stored playlist JSON for the given share ID.

interface Env {
  PLAYLISTS: KVNamespace
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
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
