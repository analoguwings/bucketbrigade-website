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
  const ogImageURL = `${origin}/api/og/${id}`
  const pageThumbURL = firstID ? `https://archive.org/services/img/${firstID}` : ''
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
  <meta property="og:image" content="${ogImageURL}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${pageURL}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${h(countLabel)}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${h(ogTitle)}">
  <meta name="twitter:description" content="${h(ogDescription)}">
  <meta name="twitter:image" content="${ogImageURL}">

  <!-- Apple Smart App Banner (shows on iOS Safari for users who don't have the app) -->
  <meta name="apple-itunes-app" content="app-id=${APP_STORE_ID}, app-argument=${pageURL}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: hsl(30 100% 98.04%);
      color: #000;
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
      background: hsl(33 100% 95.5%);
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 52px;
    }
    .brand-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .brand-name {
      font-family: 'Bebas Neue', 'Arial Narrow', Arial, sans-serif;
      font-size: 42px;
      line-height: 1;
      letter-spacing: 0.01em;
      text-transform: uppercase;
      color: #000;
    }
    .app-icon { width: 80px; height: 80px; border-radius: 18px; box-shadow: 0 8px 18px rgba(0,0,0,0.12); }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; line-height: 1.25; }
    .meta { color: rgba(0,0,0,0.55); font-size: 15px; margin-bottom: 28px; }
    .app-store-badge { display: inline-block; }
    .app-store-badge img { width: 180px; height: 60px; object-fit: contain; vertical-align: middle; }
    .learn-more {
      display: block;
      margin-top: 16px;
      font-size: 14px;
      color: rgba(0,0,0,0.55);
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 0.2em;
    }
    .learn-more:hover { color: #000; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand-row">
      <span class="brand-name">Eye Yay</span>
      <img src="https://eyeyay.app/images/eye-yay/200x200bb-75.webp" alt="Eye Yay" class="app-icon">
    </div>
    ${pageThumbURL
      ? `<img class="thumb" src="${pageThumbURL}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'thumb-placeholder',textContent:'🎬'}))">`
      : `<div class="thumb-placeholder">🎬</div>`
    }
    <h1>${h(data.name)}</h1>
    <p class="meta">${count} item${plural} from the Internet Archive</p>
    <a href="${appStoreURL}" class="app-store-badge">
      <img src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1764720000" alt="Download on the App Store">
    </a>
    <a href="https://eyeyay.app/eye-yay/" class="learn-more">Learn more</a>
  </div>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
