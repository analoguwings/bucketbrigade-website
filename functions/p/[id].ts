// GET /p/:id
// Serves the share landing page with Open Graph tags.
// - App users: iOS intercepts as a Universal Link and opens the app directly.
// - Non-app users: lands here, sees playlist info and an App Store link.

const APP_STORE_ID = '6755102519' // Replace with numeric App Store ID once live

interface Env {
  PLAYLISTS: KVNamespace
}

interface PlaylistRecord {
  name: string
  identifiers: string[]
  createdAt: string
}

function h(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export const onRequest: PagesFunction<Env> = async ({ params, env, request }) => {
  const id = params.id as string

  const raw = await env.PLAYLISTS.get(id)
  if (!raw) {
    return new Response('Playlist not found', { status: 404 })
  }

  const data: PlaylistRecord = JSON.parse(raw)
  const count = data.identifiers.length
  const firstID = data.identifiers[0] ?? ''
  const origin = new URL(request.url).origin
  // Use the generated OG image endpoint which composites text + logo over the thumbnail
  const thumbURL = `${origin}/api/og/${id}`
  const pageURL = new URL(request.url).href
  const appStoreURL = `https://apps.apple.com/app/id${APP_STORE_ID}`
  const plural = count !== 1 ? 's' : ''
  const ogTitle = `Add this curated playlist to your Eye Yay library`
  const ogDescription = `${count} item${plural} from the Internet Archive, shared with Eye Yay`
  const countLabel = `${count} item${plural}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${h(ogTitle)}</title>

  <!-- Open Graph -->
  <meta property="og:title" content="${h(ogTitle)}">
  <meta property="og:description" content="${h(ogDescription)}">
  <meta property="og:image" content="${thumbURL}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${pageURL}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${h(countLabel)}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${h(ogTitle)}">
  <meta name="twitter:description" content="${h(ogDescription)}">
  <meta name="twitter:image" content="${thumbURL}">

  <!-- Apple Smart App Banner (shows on iOS Safari for users who don't have the app) -->
  <meta name="apple-itunes-app" content="app-id=${APP_STORE_ID}, app-argument=${pageURL}">

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0c0c0c;
      color: #fff;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      text-align: center;
      max-width: 340px;
      width: 100%;
    }
    .thumb {
      width: 140px;
      height: 140px;
      object-fit: cover;
      border-radius: 16px;
      margin-bottom: 24px;
    }
    .thumb-placeholder {
      width: 140px;
      height: 140px;
      border-radius: 16px;
      background: #1e1e1e;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 52px;
    }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; line-height: 1.25; }
    .meta { color: #888; font-size: 15px; margin-bottom: 32px; }
    .btn {
      display: inline-block;
      background: #fff;
      color: #000;
      padding: 14px 32px;
      border-radius: 100px;
      font-weight: 600;
      font-size: 16px;
      text-decoration: none;
    }
    .btn:active { opacity: 0.8; }
  </style>
</head>
<body>
  <div class="card">
    ${thumbURL
      ? `<img class="thumb" src="${thumbURL}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'thumb-placeholder',textContent:'🎬'}))">`
      : `<div class="thumb-placeholder">🎬</div>`
    }
    <h1>${h(data.name)}</h1>
    <p class="meta">${count} film${plural} from the Internet Archive</p>
    <a href="${appStoreURL}" class="btn">Get Eye Yay</a>
  </div>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
