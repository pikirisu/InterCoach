# Project Status

Last updated: November 1, 2026

## Current State

Inter Coach is a backend-only Node.js/Express API for the MVP resume-analysis flow:

1. Register
2. Login
3. Receive access and refresh tokens
4. Upload a PDF resume
5. Extract resume text
6. Generate AI analysis
7. View previous resumes
8. View previous analyses
9. Refresh or logout of the active session

Sprint 1 and Sprint 2 are complete. Sprint 3 has started with the highest interview-value backend hardening: refresh-token rotation, logout/session invalidation, Docker support, OpenAPI documentation, and CI smoke checks.

The project is strong for a backend interview project because it has a coherent product flow, modular Express/Mongoose structure, ownership checks, AI-provider integration, normalized responses, automated smoke coverage, Postman coverage, Docker-ready local infrastructure, and clear docs. The remaining Sprint 3 items are realistic scale/deployment/product enhancements rather than blockers for demonstrating backend ability.

## API Response Convention

Success responses use this envelope:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success message",
  "success": true
}
```

Error responses use this envelope:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": []
}
```

Some expected failure paths can include `data` when the client needs the persisted failed record, such as failed resume extraction or failed AI analysis generation.

## Sprint 3 Progress

Completed:

- S3-01: Refresh-token rotation, logout, and session invalidation.
- S3-06: Dockerfile and Docker Compose support.
- S3-07: OpenAPI documentation in `docs/openapi.yaml`.

Partial:

- S3-05: GitHub Actions CI smoke-test workflow exists. Deployment automation still needs a chosen deployment platform.
- S3-08: Advanced AI analysis features. Stage 1 shipped: rubric-based ordinal
  rating, deterministic weighted scoring, evidence-bound findings, evidence-bound
  and rubric-ranked recommendations, and deterministic sampling. Stage 2 still
  open: target-role context, code-computed resume signals, response caching by
  content hash, and a calibration test.

- S3-04: Frontend client. A React + Vite + TypeScript client lives in `frontend/`
  and covers the full flow. Not yet wired into CI.

Not started:

- S3-02: Cloud resume storage.
- S3-03: Background jobs for AI analysis.
- S3-09: Database migration and seed strategy.

## Validation

Latest validation date: November 1, 2026

Validation command:

```bash
npm test
```

Result: 39 tests, 38 passing.

One known failure, unrelated to the analysis work: `register validation errors use
the central error envelope` expects `400`, but registration has returned `403`
since registrations were closed (`auth.controller.js:68`). This is intentional: the
pause is temporary, so the test stays as it is and gets revisited when registration
reopens.

Analysis scoring coverage (`test/analysis-scoring.test.js`, 24 tests):

- Rubric weights total 100.
- `computeOverallScore` is stable across repeated calls and spans 0-100.
- Score-band boundaries.
- Evidence verification: faithful quotes accepted, punctuation/spacing drift
  tolerated, fabricated quotes rejected, over-short quotes rejected, genuine
  absences accepted and false absences rejected.
- A model-supplied `overallScore` is ignored in favour of the computed one.
- Unverifiable findings are dropped without changing the score.
- A run where no finding survives verification fails rather than returning blanks.
- `computeScoreUpside` returns the points still recoverable per dimension.
- Recommendations rank by recoverable score rather than by the order the model
  emitted them, and the ranking is identical across repeated runs.
- Free-text recommendations are rejected without failing the analysis.
- Recommendation evidence is verified, unknown dimensions are rejected, repeated
  targets are dropped, and the list is capped deterministically.
- A two-word target passes for a recommendation but not for a finding.

Current smoke coverage:

- Healthcheck response shape.
- Central auth validation error envelope.
- Protected-route missing-token rejection.
- Refresh endpoint missing-token rejection.
- Refresh-token rotation through the real Express route.
- Refresh-token reuse invalidating the current session.
- Logout invalidating the old access-token session.
- Normalized 404 behavior.

Note: the local sandbox blocked the Node test runner from spawning its worker process, so the validation command was rerun with approval. The test suite passed after that.

## Request Order And Expected Response Fields

1. `GET /api/v1/health`
   - Expected status: `200`
   - Response fields: `success`, `statusCode`, `message`, `data`
   - `data` fields: `status`, `uptime`, `timestamp`, `database`

2. `POST /api/v1/auth/register`
   - Body: `{ name, email, password }`
   - Expected status: `201`
   - `data` fields: `user`, `accessToken`, `refreshToken`
   - Notes: `data.user` excludes `password`, `refreshToken`, and `sessionVersion`.

3. `POST /api/v1/auth/login`
   - Body: `{ email, password }`
   - Expected status: `200`
   - `data` fields: `user`, `accessToken`, `refreshToken`
   - Notes: login rotates the active session.

4. `POST /api/v1/auth/refresh-token`
   - Body: `{ refreshToken }`
   - Expected status: `200`
   - `data` fields: `user`, `accessToken`, `refreshToken`
   - Notes: the submitted refresh token is replaced by a new stored refresh token. Reusing an old refresh token invalidates the active session.

5. Store access token
   - Header format: `Authorization: Bearer <accessToken>`
   - Expected behavior: protected resume and analysis routes can read `req.user._id`.

6. `POST /api/v1/resumes`
   - Auth: required
   - Body: multipart form data with PDF field `resume`
   - Expected status: `201`
   - `data.resume` fields: `resumeId`, `fileName`, `filePath`, `fileSize`, `mimeType`, `extractedText`, `status`, `createdAt`, `updatedAt`

7. `GET /api/v1/resumes`
   - Auth: required
   - Expected status: `200`
   - `data.resumes` shape: array scoped to the authenticated user.

8. `GET /api/v1/resumes/:resumeId`
   - Auth: required
   - Expected status: `200`
   - Notes: another user's resume returns `404` or `403` depending on the endpoint path.

9. `POST /api/v1/analysis/resume/:resumeId`
   - Auth: required
   - Expected status: `201`
   - `data.analysis` fields: `analysisId`, `resumeId`, `status`, `overallScore`, `scoreBand`, `dimensions`, `strengths`, `weaknesses`, `strengthDetails`, `weaknessDetails`, `recommendations`, `recommendationDetails`, `aiModel`, `rubricVersion`, `promptVersion`, `errorMessage`, `createdAt`, `updatedAt`

10. `GET /api/v1/analysis/:analysisId`
    - Auth: required
    - Expected status: `200`
    - Notes: another user's analysis returns `403`.

11. `GET /api/v1/analysis/resume/:resumeId`
    - Auth: required
    - Expected status: `200`
    - `data.analyses` shape: array scoped to the authenticated user.

12. `DELETE /api/v1/resumes/:resumeId`
    - Auth: required
    - Expected status: `200`
    - `data` fields: `resumeId`

13. `POST /api/v1/auth/logout`
    - Auth: required
    - Expected status: `200`
    - `data` fields: `userId`
    - Notes: clears the stored refresh token and increments `sessionVersion`, so the previous access token is rejected on protected routes.

## Implemented Backend Features

- Express app with auth, resume, analysis, and health routes mounted under `/api/v1`.
- MongoDB connection through `MONGO_URI`.
- User registration and login with hashed passwords.
- JWT access token and refresh token generation on register/login.
- Refresh-token rotation with stored-token comparison.
- Logout/session invalidation through `sessionVersion` checks in JWT middleware.
- JWT-protected resume and analysis routes.
- Central Express error handling with preserved `ApiError` status codes.
- Normalized success and error response envelopes.
- Local CORS defaults for HTTP localhost clients and credentialed browser requests.
- Local PDF upload with Multer under `uploads/resumes/`.
- PDF text extraction through `pdf-parse`.
- Resume listing, detail fetch, and delete scoped to the authenticated user.
- Analysis creation for an owned processed resume.
- Rubric-based resume analysis: the model rates six weighted dimensions on a
  four-level ordinal scale, and `src/utils/analysisRubric.js` computes
  `overallScore` from those levels in code. The model never returns the score.
- Evidence-bound findings: every strength and weakness must cite a verbatim
  resume span (or a term confirmed absent). `src/utils/evidence.js` verifies each
  one and discards findings that cannot be checked.
- Evidence-bound, rubric-ranked recommendations: each suggestion names the
  dimension it serves, the resume line it changes, and an optional paste-ready
  rewrite. Ordering is computed in code from `computeScoreUpside` (the points
  still recoverable in that dimension), so the top suggestion is always the
  highest-leverage one and the order never changes between runs.
- Deterministic sampling on both providers (`temperature: 0`, `top_p: 1`, plus a
  resume-derived `seed` on OpenAI).
- OpenAI and Gemini provider support through `src/services/ai/ai.service.js`.
- Analysis detail and per-resume analysis history scoped to the authenticated user.
- Safe `.env.example` with MongoDB, JWT, CORS, and AI provider placeholders.
- Inter Coach Postman collection aligned with the current API contract.
- OpenAPI documentation in `docs/openapi.yaml`.
- Dockerfile and Docker Compose local stack.
- GitHub Actions CI workflow for `npm ci` and `npm test`.
- Minimal automated smoke tests through `npm test`.

## Environment

Required for local MVP use:

- `PORT`
- `MONGO_URI`
- `CORS_ORIGIN`
- `ACCESS_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRY`
- `REFRESH_TOKEN_SECRET`
- `REFRESH_TOKEN_EXPIRY`
- `AI_PROVIDER`
- Either `OPENAI_API_KEY` and optional `OPENAI_MODEL`, or `GEMINI_API_KEY` and optional `GEMINI_MODEL`

The local `.env` should remain ignored and must not be committed.

## Repository Notes

- The backend is the MVP target. A React + Vite + TypeScript client lives in
  `frontend/` and consumes the same API contract.
- `PROJECT_STATUS.md`, `MVP_TASKS.md`, design docs, Postman collections, tests, Docker files, and OpenAPI docs should be tracked.
- `uploads/`, `.env`, `node_modules/`, and local-only Postman metadata remain ignored.
