# Terrier Taste Frontend

Single-page React app for exploring and reviewing Boston-area restaurants. The frontend now builds as a fully static bundle so it can be hosted on GitHub Pages (or any static host) while talking to a separately hosted API.

## Prerequisites

- Node.js ≥ 18
- An API endpoint that implements the `/api` contract expected by the app (authentication, restaurants, reviews)
- A Google Maps JavaScript API key with the Places API enabled

## Project Commands

```bash
npm install        # install dependencies
npm run dev        # start Vite dev server
npm run build      # type-check + build to dist/
npm run preview    # preview the production build locally
npm run deploy     # publish dist/ to the gh-pages branch
```

`npm run deploy` uses the [`gh-pages`](https://github.com/tschaub/gh-pages) CLI and assumes the remote `origin` points to your GitHub repository.

## Environment Configuration

Create a `.env` file (or configure repository secrets in CI) with the variables the frontend needs at build time:

```
VITE_API_URL=https://your-api.example.com/api
VITE_GOOGLE_MAPS_API_KEY=AIza...
VITE_PUBLIC_BASE=/repository-name/
```

- `VITE_API_URL` — HTTPS URL where the production API lives (no trailing slash). When omitted, requests are issued relative to the current origin.
- `VITE_GOOGLE_MAPS_API_KEY` — public client key for Google Maps + Places. Without it, the Explore page shows a prompt instead of the map.
- `VITE_PUBLIC_BASE` — base path the site is served from. Use `/repository-name/` for GitHub project pages, or leave unset/`./` for root hosting.

Any sensitive values should be supplied through deployment-time environment variables rather than committed to the repository.

## Deploying to GitHub Pages

1. Set the environment variables above for your build environment (locally or in CI).
2. Run `npm run deploy`. This builds the site and pushes the contents of `dist/` to the `gh-pages` branch.
3. In your repository settings, enable GitHub Pages with the source set to `gh-pages`.

Because the project now uses a `HashRouter`, deep links work out-of-the-box on GitHub Pages without additional rewrites.

## Local API Development

The backend that previously lived in this repository has been removed. Run it from a separate project or point `VITE_API_URL` at a staging API instance. During development you can still target `http://localhost:4000/api` by placing that value in `.env`.
