# Project Status

Last updated: July 19, 2026

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

Not started:

- S3-02: Cloud resume storage.
- S3-03: Background jobs for AI analysis.
- S3-04: Frontend client.
- S3-08: Advanced AI analysis features.
- S3-09: Database migration and seed strategy.

## Validation

Latest validation date: July 19, 2026

Validation command:

```bash
npm test
```

Result: passed, 8 tests.

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
   - `data.analysis` fields: `analysisId`, `resumeId`, `status`, `overallScore`, `strengths`, `weaknesses`, `recommendations`, `aiModel`, `errorMessage`, `createdAt`, `updatedAt`

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

- The backend is the MVP target; no frontend app exists in this repository yet.
- `PROJECT_STATUS.md`, `MVP_TASKS.md`, design docs, Postman collections, tests, Docker files, and OpenAPI docs should be tracked.
- `uploads/`, `.env`, `node_modules/`, and local-only Postman metadata remain ignored.
