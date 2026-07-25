# CrimeVision AI

AI-driven crime analytics and visualization platform for the Zoho Catalyst x Karnataka State Police Datathon.

## Structure

- `crimevision-frontend/` - React 19 + Vite + TypeScript + Tailwind + shadcn-style UI, deployed to Catalyst Web Client Hosting (Slate).
- `crimevision-backend/` - Python Catalyst Advanced I/O Functions, deployed via the Catalyst CLI, backed by Catalyst Data Store, Stratus, and Cron.

## What's implemented so far (Modules 1-2)

**Module 1 - Login & role-based auth**
- `/login`, `/forgot-password` pages, glassmorphic dark UI
- `catalystAuth` wrapper (`shared/lib/catalyst/client.ts`) - swaps to the real Catalyst Web SDK automatically once `window.catalyst` is present, falls back to a local mock for standalone development
- Role-based route guarding (`RoleGuard`) for investigator / analyst / supervisor / administrator
- Backend `auth-service` function: `GET /auth/me`, `POST /auth/assign-role` (admin-only), with a `require_role` decorator enforced on every protected function

**Module 2 - Command dashboard**
- 7 KPI cards, monthly trend area chart, category distribution pie, district ranking bar chart, top-stations table, live intelligence feed rail
- Loading skeletons on every async panel, per-panel error boundaries
- Backend `dashboard-service` function: `GET /dashboard/summary`, `GET /dashboard/feed`
- Scoped AI Assistant dock (UI + wiring only; `POST /assistant/query` is a placeholder for `assistant-service`, module 11)

**Module 3 - Crime Analytics**
- Full filter panel (district, station, crime type, status, date range, victim age group, victim gender) — filters interactively rescale the mock dataset so the page feels live before the real backend is deployed
- Monthly/yearly trend toggle, category breakdown bar chart, time-of-day chart, weekday chart, seasonal radar chart, victim analysis (age + gender), offender analysis (age + repeat-offender rate)
- `crime-service` backend now implements `GET /crimes/filters` and `GET /crimes/trends`, matching the frontend's `CrimeAnalyticsResponse` shape exactly (see `common/analytics_schemas.py`) — the frontend still runs on its own local mock until the real function is deployed and Data Store is populated, but the contract between them is already locked in.

**Also scaffolded**
- `crime-service` function with a validated, whitelisted ZCQL filter builder (district / station / crime type / date range / status) ready for Module 3 (Crime Analytics)
- `jobs/nightly-aggregation-job` Cron stub that will precompute the dashboard aggregates

## LLM integration (Anthropic API)

Two modules now call a real LLM rather than returning canned text:

- **Dashboard AI Assistant** (`assistant-service`, `POST /assistant/query`) — answers are grounded in the current dashboard aggregates only. The system prompt explicitly scopes it to crime analytics and instructs it to say so and redirect to the right module if a question falls outside that data, per the brief's "do NOT create a generic ChatGPT clone" requirement.
- **AI Insights** (`insights-service`, `GET /insights/summary`, `GET /insights/district/{id}`) — generates the crime summary, trend summary, top findings, and recommendations from real aggregate numbers. The model is required to return strict JSON, which is Pydantic-validated before it reaches the frontend; if parsing fails or the LLM is unavailable, both endpoints fall back to a deterministic template summary rather than erroring out.

**Setup**: set `ANTHROPIC_API_KEY` as a Catalyst environment variable for each environment (see `env/development.env`, `env/production.env` — never commit real keys). The wrapper lives entirely in `common/llm_client.py` so the model, prompt, and token limits are changed in exactly one place. `anthropic` has been added to both functions' `requirements.txt`.

**Local dev without a deployed backend**: `src/shared/lib/dev-mocks.ts` provides canned responses for `/assistant/query` and `/insights/summary` so the assistant dock and AI Insights page are fully demoable before `catalyst deploy` — this fallback only activates in dev mode on a network failure and never runs in production.
- Full sidebar navigation and routing for every remaining module, currently rendering a "scheduled next" placeholder screen

## Running the frontend locally

```
cd crimevision-frontend
npm install
npm run dev
```

Sign in with any of the demo role buttons on the login screen (or any email containing "admin" / "supervisor" / "analyst", any 4+ character password) - the local mock auth infers role from the email until the real Catalyst Auth SDK is wired in via `catalyst init` / `catalyst serve`.

`npm run build` has been verified to produce a clean TypeScript + Vite production build with zero errors.

## Deploying to Zoho Catalyst

1. `npm install -g zcatalyst-cli` and `catalyst login`
2. From `crimevision-backend/`: `catalyst deploy --only functions` (deploys `auth-service`, `dashboard-service`, `crime-service`)
3. Create the Data Store tables listed in `01-architecture-plan.md` section 3, matching the columns referenced in `common/schemas.py`
4. From `crimevision-frontend/`: `npm run build`, then `catalyst deploy --only client` to push `dist/` to Web Client Hosting
5. Configure API Gateway routes to match `crimevision-backend/catalyst.json`

## Next modules (build order)

3. Crime Analytics (filters + trend charts) - `crime-service` backend is already scaffolded
4. Crime Hotspot Intelligence (Leaflet map)
5. Criminal Network Analysis (Cytoscape graph)
6. Pattern Discovery
7. AI Prediction + Explainable AI
8. AI Insights UI polish (District Intelligence Report drill-down — backend already supports `/insights/district/{id}`)
9. Reports (PDF/CSV via SmartBrowz)
10. Notification Center
11. Dashboard AI Assistant UI polish (backend already live via `assistant-service`)
12. Unique features layer
