# Speed Deposit Launcher — Vercel Deployment

## Folder structure

```
vercel-deploy/
  ├── api/
  │   └── Internal-tools.js     ← Serverless proxy for GreenDot SOAP
  ├── public/
  │   └── index.html           ← The launcher UI
  └── vercel.json              ← Vercel routing config
```

## How to deploy

### Option A — Vercel CLI
```bash
npm i -g vercel
cd vercel-deploy
vercel
```

### Option B — Vercel Dashboard (drag & drop)
1. Go to https://vercel.com/new
2. Import this folder as a project
3. Click Deploy

## How it works

```
Browser → /api/Internal-tools (Vercel function) → greendotauth.tryspeed.dev
```

The `api/Internal-tools.js` serverless function forwards SOAP requests
server-side, bypassing browser CORS restrictions.

No local proxy or Node.js install needed for end users.
Just share the Vercel URL — it works out of the box.
