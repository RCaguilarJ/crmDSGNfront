<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7d87ab26-cdff-4fcf-81b4-9f7722e11c0c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Para desarrollo local, copia `.env.development.example` como
   `.env.development.local`. Vite carga este archivo únicamente en desarrollo y
   Git lo ignora, por lo que el `.env` usado para producción no se modifica.
3. Run the app:
   `npm run dev`

El frontend local se conectará a `http://localhost:3000`. Para comprobar el
build que se publicará, usa `npm run build`; este comando no carga
`.env.development.local`.
