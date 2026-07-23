# Inter Coach

Inter Coach is a backend API for an interview-coaching resume analysis product. Users can register, login, upload PDF resumes, extract resume text, generate AI analysis, and review resume and analysis history.

The project is intentionally backend-first: it demonstrates a complete API flow, authenticated ownership checks, normalized response contracts, provider-backed AI integration, smoke tests, Postman coverage, OpenAPI documentation, and Docker-ready local infrastructure.

## Core Flow

1. Register or login.
2. Store `data.accessToken` and `data.refreshToken`.
3. Upload a PDF resume with `Authorization: Bearer <accessToken>`.
4. Generate analysis for the processed resume.
5. Fetch resume and analysis history.
6. Refresh tokens with `POST /api/v1/auth/refresh-token` when needed.
7. Logout with `POST /api/v1/auth/logout` to invalidate the active session.

## Tech Stack

- Node.js and Express
- MongoDB with Mongoose
- JWT access and refresh tokens
- Multer for PDF upload
- `pdf-parse` for resume text extraction
- OpenAI or Gemini for AI analysis
- Node's built-in test runner

## Local Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Update `.env` with a local MongoDB URL, JWT secrets, and either OpenAI or Gemini credentials for live AI analysis.

Healthcheck:

```bash
curl http://localhost:3000/api/v1/health
```

## Docker Setup

```bash
docker compose up --build
```

The compose file starts the API and MongoDB. Uploaded resumes are mounted at `./uploads` so local test files survive container restarts.

## Tests

```bash
npm test
```

The smoke suite starts Express on a temporary port without requiring a live MongoDB connection. It verifies healthcheck behavior, normalized errors, protected-route rejection, refresh-token rotation, refresh-token reuse invalidation, logout, and normalized 404 handling.

## API Documentation

OpenAPI documentation lives in `docs/openapi.yaml`.

Postman requests live under `postman/collections/Inter Coach/` with a matching environment in `postman/environments/Inter Coach.environment.yaml`.

## Sprint 3 Status

Completed:

- Refresh-token rotation, logout, and session invalidation.
- Dockerfile and Docker Compose support.
- OpenAPI API documentation.
- CI smoke-test workflow.

Deferred by design:

- Cloud object storage for resumes.
- Background queue/worker for AI analysis.
- Frontend client.
- Advanced AI analysis features.
- Database migration and seed strategy.

These deferred items are good next steps, but the current project is already strong as a backend interview project because the main user journey works end to end and the production-readiness story is visible in code, tests, docs, and infrastructure.
