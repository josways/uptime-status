# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build & Run
- `npm run dev` — dev server (Vite)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build locally
- `npm run deploy` — build and deploy to Cloudflare Workers
- `npm run cf-preview` — build and preview with Wrangler

## Architecture
- **Runtime config via `window.Config`**: `public/config.js` sets `window.Config` (ApiKeys, CountDays, SiteName, Navi) at runtime. Config changes do NOT require rebuilding — just edit `config.js` and redeploy. All components read directly from `window.Config`, not via props.
- **Multi-instance pattern**: `App` renders one `UptimeRobot` component per API key in `ApiKeys` array. `ApiKeys` accepts both string and array formats.
- **Single SCSS file**: All styles in `src/app.scss` (~174 lines). No CSS Modules or styled-components.

## Critical Gotchas
- `GetMonitors` in `src/common/uptimerobot.js` constructs `custom_uptime_ranges` by joining date ranges with `-`, then uses `ranges.pop()` to extract the overall average from the API response. The last element is always the total range.
- UptimeRobot status codes: `2` → ok, `9` → down, others → unknown. Only logs with `type === 1` (failure events) are counted.
- `dangerouslySetInnerHTML` is used for monitor names in `uptimerobot.js` — names render as raw HTML.
- Version number is read via `import Package from '../../package.json'` in `src/components/app.jsx` (non-standard relative path from `src/components/`).
- `Link` component maps `props.to` → `href`, placed after `{...props}` spread so `href` takes priority.
- `React.StrictMode` is commented out in `src/index.js`.
- `formatDuration` in `src/common/helper.js` outputs Chinese time format (天/小时/分/秒).
