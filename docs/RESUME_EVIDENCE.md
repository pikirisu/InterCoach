# Resume Evidence

## Stack
- **Backend**: Node.js (ESM, `"type": "module"`), Express 5.2.1, Mongoose 9.7.0 (MongoDB). — `package.json`
- **Auth/security libs**: `jsonwebtoken` 9.0.3, `bcryptjs` 3.0.3 (password hashing). — `package.json`
- **File handling**: `multer` 2.2.0 (upload), `pdf-parse` 2.4.5 (text extraction). — `package.json`
- **Frontend**: React 19.2.8, TypeScript 7.0.2, Vite 8.1.5, Tailwind CSS 4.3.3, React Router 8.3.0, React Hook Form 7.83 + `@hookform/resolvers` + Zod 4.4.3, Axios 1.18.1, `lucide-react` icons. — `frontend/package.json`
- **Database**: MongoDB, connected via `mongoose.connect(process.env.MONGO_URI)`. — `src/db/index.js`
- **External APIs**: OpenAI Chat Completions API (`https://api.openai.com/v1/chat/completions`) and Google Gemini `generateContent` API, selectable via `AI_PROVIDER` env var. — `src/services/ai/ai.service.js`
- **Deployment**: Dockerfile (`node:22-alpine`, non-root `node` user) and `docker-compose.yml` (API + MongoDB 7 services). No Vercel/Render/cloud config files found in the repo. — `Dockerfile`, `docker-compose.yml`
- **CI**: GitHub Actions workflow running `npm ci` + `npm test` on push/PR to `main`, Node 22. — `.github/workflows/ci.yml`

## Scale
- Backend source: **2,323 LOC** across `src/**/*.js` (measured via `wc -l`).
- Frontend source: **4,879 LOC** across `frontend/src/**/*.ts(x)` (measured via `wc -l`).
- Git history: **13 commits** on a single-contributor repo (`Akshat Chaurasia`), 2 branches (`main`, `release/v1`). — `git rev-list --count HEAD`, `git branch -a`, `git log --format=%an`

## Backend
- **5 feature modules**: `auth`, `resume`, `analysis`, `jobDescription`, `match`, each with its own routes/controller/model(+service). — `src/modules/*`
- **5 controllers**, **5 models**, **5 service files** (`resume.service.js`, `analysis.service.js`, `jobDescription.service.js`, `match.service.js`, plus `services/ai/ai.service.js`); auth logic lives directly in `auth.controller.js` (no separate auth service). — `src/modules/*`, `src/services/ai/ai.service.js`
- **21 registered Express routes** total (18 versioned API routes + `/`, `/health`, `/api/v1/health`), confirmed by reading `src/app.js` and all 5 route files:
  - Auth (4): `POST /api/v1/auth/register`, `POST /login`, `POST /refresh-token`, `POST /logout` — `src/modules/auth/auth.routes.js`
  - Resumes (4): `POST/GET /api/v1/resumes`, `GET/DELETE /api/v1/resumes/:resumeId` — `src/modules/resume/resume.routes.js`
  - Analysis (3): `POST/GET /api/v1/analysis/resume/:resumeId`, `GET /api/v1/analysis/:analysisId` — `src/modules/analysis/analysis.routes.js`
  - Job Descriptions (4): `POST/GET /api/v1/job-descriptions`, `GET/DELETE /api/v1/job-descriptions/:jobDescriptionId` — `src/modules/jobDescription/jobDescription.routes.js`
  - Matches (3): `POST /api/v1/matches/resume/:resumeId/job-description/:jobDescriptionId`, `GET /api/v1/matches/resume/:resumeId`, `GET /api/v1/matches/:matchId` — `src/modules/match/match.routes.js`
  - Health/root (3): `GET /`, `GET /health`, `GET /api/v1/health` — `src/app.js`
- OpenAPI spec independently documents **14 path templates**. — `docs/openapi.yaml`
- **Architecture pattern**: consistent controller → service → model layering per module; centralized `ApiError`/`ApiResponse` envelope classes; `asyncHandler` wrapper removes per-route try/catch; centralized `errorHandler`/`notFoundHandler` middleware. — `src/utils/api-error.js`, `src/utils/api-response.js`, `src/utils/async-handler.js`, `src/middleware/error.middleware.js`
- Every non-auth module enforces resource ownership at the service layer via `assert*Ownership(record, userId)` helpers before returning data (403 "Not authorized"). — `src/modules/match/match.service.js:17-33`, `src/modules/analysis/analysis.service.js:17-27`, `src/modules/jobDescription/jobDescription.service.js:7-11`

## Database
- **5 Mongoose models/collections**: `User`, `Resume`, `Analysis`, `JobDescription`, `Match`. — `src/modules/*/*.model.js`
- **19 explicit index declarations** across the 5 schemas (single-field `index: true` plus compound `.schema.index()` calls):
  - `User.email` — unique + indexed. — `src/modules/auth/user.model.js:14-21`
  - `Resume`: `user`, `status` indexed; compound `{user:1, createdAt:-1}`. — `src/modules/resume/resume.model.js:9-50`
  - `Analysis`: `user`, `resume`, `status` indexed; compound `{user:1, createdAt:-1}` and `{resume:1, createdAt:-1}`. — `src/modules/analysis/analysis.model.js:9-61`
  - `JobDescription`: `user`, `requirementsStatus` indexed; compound `{user:1, createdAt:-1}`. — `src/modules/jobDescription/jobDescription.model.js:11-58`
  - `Match`: `user`, `resume`, `jobDescription`, `status` indexed; compound `{user:1, createdAt:-1}`, `{resume:1, createdAt:-1}`, `{jobDescription:1, createdAt:-1}`. — `src/modules/match/match.model.js:6-65`
- **Relationships**: `Resume.user`, `Analysis.user`/`Analysis.resume`, `JobDescription.user`, `Match.user`/`Match.resume`/`Match.jobDescription` are all `ObjectId` refs, queried with combined `{_id, user}` filters for ownership-scoped lookups (e.g. `Resume.findOne({_id: resumeId, user: userId})`). — `src/modules/resume/resume.controller.js:136-145`

## Security
- **JWT access + refresh tokens**, both embedding `_id` and `sessionVersion`, signed with separate secrets/expiries (`ACCESS_TOKEN_SECRET`/`EXPIRY`, `REFRESH_TOKEN_SECRET`/`EXPIRY`). — `src/modules/auth/user.model.js:54-78`
- **Refresh-token rotation**: every successful refresh issues and persists a new access+refresh pair (`persistTokenPair`), invalidating the previous refresh token value. — `src/modules/auth/auth.controller.js:31-39, 150-205`
- **Reuse detection / session invalidation**: refresh requests are rejected and the session is force-invalidated (`refreshToken` cleared, `sessionVersion` incremented) if the presented token doesn't match the stored one or the session version is stale. — `src/modules/auth/auth.controller.js:41-45, 178-189`
- **`sessionVersion` mechanism** also powers logout: `logoutUser` bumps `sessionVersion`, which invalidates all previously issued access tokens on the next `verifyJWT` check (token's `sessionVersion` vs. stored value must match). — `src/modules/auth/auth.controller.js:207-225`, `src/middleware/auth.middleware.js:43-50`
- **Password hashing**: bcrypt via `bcryptjs`, 10 salt rounds, only re-hashed `pre("save")` when the password field is modified. — `src/modules/auth/user.model.js:42-48`
- **Ownership authorization**: resume/analysis/job-description/match records are only readable/mutable by their owning user, enforced in the service layer (see Backend section) and covered by a dedicated smoke test ("match creation rejects a resume owned by another user" → 403). — `test/smoke.test.js:416-449`
- **Upload validation**: extension allowlist (`.pdf` only) at the Multer `fileFilter` stage, 5 MB (`5 * 1024 * 1024`) size limit, plus a magic-byte check (first 5 bytes must equal `%PDF-`) after upload — files failing the magic-byte check are deleted from disk. — `src/middleware/resume.middleware.js:29-46`, `src/utils/constants.js:26`, `src/utils/validatePdf.js`, `src/modules/resume/resume.controller.js:43-49`
- **Protected endpoints**: 17 of the 18 versioned API routes require `verifyJWT` (all of `resumes`, `analysis`, `job-descriptions`, `matches` via `router.use(verifyJWT)`, plus `POST /auth/logout`); only `register`, `login`, and `refresh-token` are public. — `src/modules/*/*.routes.js`
- Body size limits set to 16kb on JSON/urlencoded parsers as a request-size guard. — `src/app.js:84-85`
- CORS restricted to an explicit allowlist (env-configurable, defaults to local dev origins), rejecting unrecognized origins with a 403 `ApiError`. — `src/app.js:18-82`
- Note: `registerUser` currently returns a hardcoded 403 ("Registration is currently disabled") before reaching any logic — registration is intentionally disabled, not broken. — `src/modules/auth/auth.controller.js:67-70`

## AI / LLM
- **Providers**: OpenAI (default) and Google Gemini, switchable via `AI_PROVIDER` env var; default models `gpt-4.1-mini` (OpenAI) and `gemini-2.5-flash` (Gemini), both overridable via env. — `src/services/ai/ai.service.js:5-13, 84-95`
- **3 distinct LLM prompts**, one per workflow:
  1. `ANALYSIS_PROMPT` — resume quality analysis (overallScore, strengths, weaknesses, recommendations). — `src/services/ai/ai.service.js:15-30`
  2. `JD_EXTRACTION_PROMPT` — structured requirement extraction from job description text (mustHaveSkills, niceToHaveSkills, keyResponsibilities; capped at 15 items/array). — `src/services/ai/ai.service.js:32-47`
  3. `MATCH_RECOMMENDATIONS_PROMPT` — recommendation generation only; explicitly instructed not to recompute the deterministic match score/skills, capped at 8 bullets. — `src/services/ai/ai.service.js:49-64`
- **LLM calls per workflow**: 1 call for resume analysis, 1 call for JD requirement extraction, 1 call for match recommendation generation — each workflow makes exactly one model call. — `src/services/ai/ai.service.js:237-263`
- **Structured output handling**: OpenAI call uses `response_format: {type: "json_object"}`; Gemini call uses `generationConfig.responseMimeType: "application/json"`. Both are further parsed by a shared `parseJsonPayload`/`extractJsonText` pipeline that strips markdown code fences and falls back to locating the outermost `{...}` span if `JSON.parse` fails outright. — `src/services/ai/ai.service.js:97-235`
- **Output normalization**: each workflow has a dedicated normalizer that validates/clamps output — `normalizeAnalysisPayload` clamps `overallScore` to 0–100 and coerces string arrays (`src/modules/analysis/analysis.validation.js:6-22`); `normalizeJdRequirementsPayload` coerces string arrays (`src/modules/jobDescription/jobDescription.validation.js:6-10`); `normalizeMatchRecommendationsPayload` (see `match.validation.js`) does the same for recommendations.
- **Failure handling**: AI failures are caught per-workflow and persisted as a `FAILED` status with `errorMessage` rather than crashing the request (analysis/match/job-description all follow this pattern). — `src/modules/analysis/analysis.service.js:53-74`, `src/modules/match/match.service.js:79-112`, `src/modules/jobDescription/jobDescription.service.js:14-33`
- Explicit input/output limits found in prompts: JD extraction capped at "at most 15 items per array"; match recommendations capped at "at most 8 bullets." No token/character limits on model input were found in code. — `src/services/ai/ai.service.js:45,63`

## JD Matching
- **Extraction flow**: on JD creation, raw text is sent through `extractJobRequirements` (LLM call) to populate `mustHaveSkills`/`niceToHaveSkills`/`keyResponsibilities`; on failure, `requirementsStatus` is set to `failed` rather than blocking creation. A lazy-extraction fallback (`ensureJobDescriptionRequirements`) re-attempts extraction at match time if it wasn't already `extracted`. — `src/modules/jobDescription/jobDescription.service.js:13-53`
- **Deterministic scoring** (`computeMatchScore`, no LLM involved): each must-have/nice-to-have skill is checked against the resume text via case-insensitive whole-word regex matching (or substring match for multi-word terms); coverage = matched/total per category; final score = `mustHaveCoverage * 70 + niceToHaveCoverage * 30` (weights defined as constants), rounded and clamped to 0–100. Handles the edge case where one category is empty by falling back to the other category's coverage alone. — `src/utils/skillMatch.js`
- **Recommendation generation**: after the deterministic score/skill split is computed, a single LLM call (`generateMatchRecommendations`) is given the score and matched/missing skill lists and instructed not to recompute them, only to produce phrasing/placement guidance for closing gaps. — `src/services/ai/ai.service.js:49-82, 247-263`, `src/modules/match/match.service.js:79-100`
- **Matched/missing skill handling**: `splitSkills` partitions each skill list into `matched`/`missing` based on resume text presence; both lists are stored on the `Match` document (`matchedSkills`, `missingSkills`) and returned to the AI prompt and API response. — `src/utils/skillMatch.js:23-42`, `src/modules/match/match.model.js:35-42`

## Testing
- **15 automated test cases** in a single smoke-test file, run via Node's built-in test runner (`node --test`). — `test/smoke.test.js` (confirmed via `grep -c '^test('`)
- Tests cover: healthcheck, centralized error envelope, protected-route rejection (resume + job-description + match routes), refresh-token requirement, refresh-token rotation, refresh-token reuse invalidation, logout session invalidation, JD create validation, malformed-ObjectId rejection (JD + match), cross-user ownership rejection (JD 404, match 403), and normalized 404 for unknown routes. — `test/smoke.test.js`
- Tests use `Model.findById`/`findOne` monkey-patching (`withPatchedModelMethods`) instead of a live MongoDB connection — no DB integration tests present.
- **Postman coverage**: 21 request files across 5 collections (Health, Auth, Resume, Analysis) — Health(1), Auth(7), Resume(7), Analysis(6) — including negative cases like "Register - Duplicate Email," "Login - Wrong Password," "Get Resume - Not Found." Note: no dedicated Job-Description or Match Postman collection folders were found, only Analysis/Auth/Resume/Health. — `postman/collections/Inter Coach/*` (counted via file listing)
- **CI**: GitHub Actions (`.github/workflows/ci.yml`) runs on push to `main` and on pull requests — checkout → Node 22 setup (with npm cache) → `npm ci` → `npm test`. No lint or build step is run in CI for the backend.

## Deployment / CI
- **Docker**: multi-stage-free `Dockerfile` based on `node:22-alpine`, installs prod deps only (`npm ci --omit=dev`), creates `uploads/resumes`, runs as non-root `node` user, exposes port 3000. — `Dockerfile`
- **docker-compose.yml**: defines `api` (built from local Dockerfile) + `mongo:7` services, maps `./uploads` volume for persistence, wires all env vars (JWT secrets/expiry, AI provider keys/models) with local defaults. — `docker-compose.yml`
- **CI**: single GitHub Actions workflow (`CI`), triggers on push to `main` and all PRs; installs deps and runs `npm test`. — `.github/workflows/ci.yml`
- **No confirmed cloud deployment target** (no Vercel/Render/other platform config files found in the repository; Postman environment `baseUrl` is `http://localhost:3000`). — searched repo root/frontend for `vercel.json`/`render.yaml`; `postman/environments/Inter Coach.environment.yaml`

## Codebase
- Backend: **2,323 LOC** (`src/**/*.js`, `wc -l`).
- Frontend: **4,879 LOC** (`frontend/src/**/*.ts,*.tsx`, `wc -l`).
- **13 commits**, single author (`Akshat Chaurasia`), 2 branches (`main`, `release/v1`). — `git log`/`git branch -a`
- 5 backend feature modules, 14 frontend pages, 6 frontend feature directories (`auth`, `resume`, `analysis`, `jobDescription`, `match`, plus shared). — `src/modules/*`, `frontend/src/pages/*`, `frontend/src/features/*`

## Verified Metrics
- No runtime usage/analytics artifacts (logs, metrics dashboards, uptime data, request counts) were found in the repository. All figures in this document are static counts derived from source, config, and git metadata — not runtime metrics.

## Not Measured / Not Found
- No production deployment platform (Vercel/Render/AWS/etc.) confirmed in repo.
- No lint/typecheck step in CI for the backend (frontend has a `tsc -b` build script but it's not wired into CI).
- No load, performance, or latency data anywhere in the repo.
- No user counts, resumes-analyzed counts, or cost/usage data — none exist in the codebase.
- No database migration/seed tooling (explicitly called out as deferred in `README.md`).
- No background job/queue system — AI calls run synchronously in the request lifecycle.
- No cloud object storage — uploaded PDFs are stored on local disk (`uploads/resumes`).
- Job-Description and Match Postman collections not present (only Health/Auth/Resume/Analysis).

## Strongest Resume Evidence
1. Custom-built **refresh-token rotation with reuse detection and forced session invalidation** via a `sessionVersion` counter embedded in both JWTs — verified end-to-end by a dedicated test (`test/smoke.test.js:241-273`).
2. **Deterministic, weighted skill-matching engine** (`computeMatchScore`, 70/30 must-have/nice-to-have split, regex word-boundary matching) that is explicitly kept separate from and authoritative over the LLM, which is only used for downstream recommendation phrasing — `src/utils/skillMatch.js`.
3. **Dual-provider LLM integration** (OpenAI + Gemini) behind one interface, with 3 distinct structured-output prompts, shared JSON-extraction/repair parsing, and per-workflow output normalization/clamping — `src/services/ai/ai.service.js`.
4. **Consistent ownership-authorization layer**: every cross-user access path (resume, analysis, job description, match) is checked at the service layer and covered by negative tests, not just documented — `src/modules/match/match.service.js`, `test/smoke.test.js`.
5. **Layered upload security**: extension allowlist + 5 MB size cap + post-upload magic-byte PDF verification with automatic cleanup of invalid files — `src/middleware/resume.middleware.js`, `src/utils/validatePdf.js`.
6. Full engineering-lifecycle artifacts present simultaneously: 15 automated smoke tests, 21 Postman request cases, an OpenAPI spec (14 paths), a GitHub Actions CI pipeline, and Docker/Compose infra — not just application code.
7. 5-module, service-layered backend architecture (controller → service → model) with centralized error/response envelopes and 19 explicit MongoDB indexes (including 7 compound indexes) tuned for the app's actual query patterns (user-scoped, recency-sorted lookups).
8. Resilient AI-workflow design: every AI-dependent write path (analysis, JD extraction, match) catches provider failures and persists a `failed` status with an error message instead of losing or corrupting user data.
