# Inter Coach — Interview Prep Cheat Sheet

Everything below is checked against the actual code as of 2026-08-18. Where nothing exists, it says so honestly instead of guessing.

## 1. What it does (30-sec pitch)

- **Uploads:** A PDF resume (only PDFs, ≤5MB).
- **Analyzes:** The extracted resume text is sent to an LLM (OpenAI or Gemini) which judges quality, clarity, impact, structure, and relevance.
- **Returns:** An overall score (0–100), strengths, weaknesses, and actionable recommendations — plus resume/analysis history per user.
- **Problem solved:** Manual resume review is slow and subjective. This gives instant, structured, repeatable feedback so a candidate can iterate on their resume before applying.
- **Honest caveat:** It analyzes the resume alone — there's no job-description input/matching yet, so don't claim "tailored to a JD" in an interview.

## 2. Tech stack (actual)

- **Backend:** Node.js, Express 5
- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS v4, React Router 8, React Hook Form + Zod, Axios, lucide-react
- **Database:** MongoDB + Mongoose 9
- **Auth:** Custom JWT (access + refresh), bcryptjs password hashing — no OAuth, no session store like Redis
- **AI/LLM:** OpenAI (`gpt-4.1-mini` default) or Google Gemini (`gemini-2.5-flash` default), selected via `AI_PROVIDER` env var; called with raw `fetch`, no SDK
- **File processing:** Multer (disk storage) + `pdf-parse` for text extraction + a custom magic-byte PDF check
- **Deployment:** Dockerfile + docker-compose locally, GitHub Actions CI; **live** on Render (backend) + Vercel (frontend) — but the deployed frontend is behind this repo's checked-out state (see §11)
- **Storage:** Local filesystem (`./uploads/resumes`) — no S3/cloud storage
- **Third-party APIs:** OpenAI Chat Completions API, Google Gemini `generateContent` API

## 3. What happens after upload (actual pipeline)

```text
Upload (multipart, field "resume")
  → Multer disk storage + extension filter
  → magic-byte check (reads first 5 bytes, must be "%PDF-")
  → Resume doc created (status: uploaded)
  → status → processing
  → pdf-parse extracts text
  → status → processed (or failed, record kept either way)

[separate authenticated call] POST /analysis/resume/:id
  → ownership check (resume.user === req.user._id)
  → Analysis doc created (status: processing)
  → resume text sent to configured LLM with a strict-JSON system prompt
  → response parsed (strips ```json fences, falls back to brace-slicing if parse fails)
  → payload normalized (score clamped 0-100, arrays coerced to trimmed strings)
  → Analysis doc updated: status completed + score/strengths/weaknesses/recommendations
    (or status failed + errorMessage, record still returned to client)
```

## 4. AI functionality actually built

Built myself:

- LLM API calls (both OpenAI and Gemini, behind a provider switch)
- The analysis prompt (system prompt demanding strict JSON, no markdown)
- Structured JSON output (`response_format: json_object` for OpenAI, `responseMimeType: application/json` for Gemini)
- A tolerant parser/repair layer for when the model doesn't return clean JSON
- Payload validation/normalization (rejects non-numeric scores, clamps range, sanitizes arrays)

Not built (be honest if asked):

- No job-description matching/comparison
- No rule-based ATS keyword scoring — the score is entirely LLM-judged, not computed
- No dedicated missing-skills detector beyond whatever the LLM puts in weaknesses/recommendations
- No embeddings/RAG/vector search, no fine-tuning, no section classification (whole resume text sent as one blob)

## 5. Non-trivial backend architecture

Actually implemented:

- JWT access + refresh flow with **refresh-token rotation and reuse detection**
- **Session invalidation via a `sessionVersion` counter** embedded in the JWT — logout or detected token reuse bumps the version, instantly invalidating all outstanding access tokens with no blacklist/Redis needed
- Ownership-based authorization (404 vs 403 handled deliberately per endpoint)
- Centralized error middleware normalizing Mongoose `ValidationError`/`CastError`/duplicate-key errors into one response envelope
- File-upload pipeline: size limit, extension filter, sanitized filenames, **plus** a magic-byte content check (extension alone is spoofable)
- Consistent success/error response envelope (`ApiResponse`/`ApiError`)

Not implemented — don't claim these: RBAC (a roles enum exists in `constants.js` but is unused leftover boilerplate), rate limiting, caching, background job queue, pagination, DB transactions, email/webhooks.

## 6. Database

- **MongoDB / Mongoose**, 3 models: `User`, `Resume`, `Analysis`
- **Relationships:** `Resume.user → User`, `Analysis.user → User`, `Analysis.resume → Resume` (one user → many resumes; one resume → many analyses, since re-running analysis creates a new record instead of overwriting)
- Schema hand-designed, not scaffolded
- **Indexes:** `User.email` (unique), `Resume{user}`, `Resume{user, createdAt}` compound, `Analysis{user}`, `Analysis{resume}`, `Analysis{user, createdAt}`, `Analysis{resume, createdAt}`
- No multi-document transactions used (writes are single-document)
- Queries: ownership-scoped `findOne({_id, user})`, sorted history queries, `.select()` projections to strip sensitive fields (password/refreshToken/sessionVersion)

## 7. Auth & security (actual)

- JWT access token (short-lived) + refresh token (longer-lived), separate secrets
- `bcryptjs` password hashing (10 rounds) in a pre-save hook
- Refresh-token rotation: server stores exactly one refresh token per user and compares on use; mismatch/reuse invalidates the session
- `sessionVersion` check on every protected request and on refresh — this is what makes logout actually work with stateless JWTs
- Ownership checks instead of trusting client-supplied IDs
- File-type validation: extension filter + magic-byte PDF header check
- File-size cap (5MB) via Multer
- CORS allowlist (explicit origins, `credentials: true`, restricted methods/headers — not wildcard)
- Request body size limits (16kb) on JSON/urlencoded parsing
- **Not implemented:** OAuth, rate limiting, CSRF protection (mitigated somewhat by using bearer tokens instead of cookies), no `helmet`/security-header middleware
- **Current state:** registration is hard-disabled in code (`registerUser` returns 403 immediately) per the latest commit — mention this if asked about live behavior

## 8. What was technically difficult (2–4 things)

1. **Stateless "logout everywhere" without Redis** — getting refresh-token rotation, reuse detection, and instant session invalidation to work using only a stored refresh token + a `sessionVersion` counter compared inside JWT middleware.
2. **Making two different LLM providers return usable structured data** — OpenAI and Gemini don't format "JSON" the same way (code fences, stray prose), so I had to write a tolerant parser (strip fences → fall back to brace-slicing) plus a normalization layer since the model can't be trusted to always honor the schema (out-of-range scores, wrong types).
3. **Real PDF validation, not just trusting `.pdf`** — checking magic bytes (`%PDF-`) instead of relying on a spoofable extension, and treating "uploaded but extraction failed" or "analysis failed" as legitimate stored states rather than just throwing errors and losing the record.
4. **Keeping one response contract across success and partial failure** — e.g. a failed analysis still returns the persisted analysis record nested inside the error response, so the frontend doesn't need special-case branches per failure mode.

## 9. Optimization

Honestly: **nothing has been benchmarked or measured.** No caching, no query optimization pass, no before/after numbers exist in the repo. If asked, say the focus so far has been correctness and architecture (auth, ownership, error handling), and performance work (pagination, caching, benchmarking) is an acknowledged next step — don't invent numbers.

## 10. Testing

- Node's **built-in test runner** (`node --test`) — no Jest/Supertest
- **8 automated smoke tests** (`test/smoke.test.js`) run against the real Express app over an ephemeral HTTP server: healthcheck shape, validation-error envelope, protected-route rejection, refresh-token rotation, refresh-token reuse invalidation, logout/session invalidation, normalized 404. `User` model methods are patched/mocked so no live MongoDB is required for these tests.
- **Manual/Postman testing:** 26 files under `postman/collections/Inter Coach/` covering Health (1), Auth (6 — incl. duplicate email, wrong password, missing fields), Resume (6 — incl. invalid id, not found, unauthorized), Analysis (5 — incl. invalid resume id, not found, unauthorized) — roughly **18 request-level cases** across 4 endpoint groups.
- No integration tests against a live DB, no load testing.

## 11. Deployment

- **Backend on Render, frontend on Vercel** — it is live, correct that in interviews.
- CI (GitHub Actions `npm ci` + `npm test`) has no deploy step — deploys are manual/platform-triggered, not CD.
- **Known gap: the deployed frontend is stale.** It's behind the code checked into this repo, and it currently labels the LLM-generated `overallScore` as an "**ATS score**" in the UI — which is inaccurate and worth fixing before showing it to anyone (there's no real ATS keyword-matching logic behind it, see §4). Redeploy the current `frontend/` and rename that label before a live demo.
- Users: effectively 0 (personal/dev use) — no real traffic, no analytics on usage.

## 12. GitHub / repo size

- ~1,400 LOC backend (`src/**/*.js`), ~3,474 LOC frontend (`.ts`/`.tsx`)
- **13 commits** on `main`; one extra branch `release/v1`; single remote (`origin`)
- **Contributor:** just you (Akshat Chaurasia)
- Docs: `README.md`, `PROJECT_STATUS.md`, `MVP_TASKS.md`, OpenAPI spec at `docs/openapi.yaml`
- No architecture diagram, no issues/PRs (solo repo, no PR workflow used)

## 13. Feature to be most proud of

**Refresh-token rotation + reuse detection + `sessionVersion` invalidation.** It's a real security mechanism, not tutorial boilerplate — it solves the actual hard problem of "how do you log a user out everywhere" when your auth is stateless JWTs, without needing Redis or a blacklist table. It's also the one piece of the system that has dedicated automated tests proving the rotation/reuse/logout behavior actually works end to end, not just assumed.
