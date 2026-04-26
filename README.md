<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/aaee3d9f-52f4-4b0f-a1f1-cdb408790cae

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set server-only secrets in `.env.local`:
   `GEMINI_API_KEY=...`
   `FIREBASE_PROJECT_ID=vestia-38656`
3. Run the app UI:
   `npm run dev`

The Gemini API key must never be exposed with a `VITE_` prefix or bundled into the browser. The browser calls `/api/extract-clothing`, and the server verifies the signed-in Firebase user before calling Gemini.

## Production hosting

### Vercel

Vercel is the simplest option for this codebase because the `api/extract-clothing.ts` function is picked up automatically.

1. Import the repository in Vercel.
2. Set environment variables in the Vercel project:
   `GEMINI_API_KEY`
   `FIREBASE_PROJECT_ID`
   optional: `GEMINI_IMAGE_MODEL`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add your Vercel domain to Firebase Authentication authorized domains.

### Private Oracle VM

Use this when you want the API and secrets on your own server.

1. Provision an Oracle Linux or Ubuntu VM and install Node.js 22+.
2. Clone the repo and run `npm install && npm run build`.
3. Create a private environment file or systemd environment with:
   `GEMINI_API_KEY`
   `FIREBASE_PROJECT_ID`
   `PORT=3000`
4. Start with `npm run start`.
5. Put Caddy, Nginx, or Oracle Load Balancer in front for HTTPS, and only expose ports 80/443 publicly.
6. Add the public domain to Firebase Authentication authorized domains.
