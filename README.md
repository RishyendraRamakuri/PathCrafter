# PathCrafter

[![Repository Version](https://img.shields.io/github/v/release/RishyendraRamakuri/PathCrafter?label=repo%20version)](https://github.com/RishyendraRamakuri/PathCrafter/releases)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](./LICENSE)
[![Open Issues](https://img.shields.io/github/issues/RishyendraRamakuri/PathCrafter)](https://github.com/RishyendraRamakuri/PathCrafter/issues)

PathCrafter is a modular learning-path management platform. The repository is organized as a small monorepo with three primary service areas:

- `backend` — Express API (MongoDB + Mongoose) that exposes:
  - /api/users
  - /api/learning-paths
  - /api/ml
  - health and root endpoints
- `frontend` — Single-page application (client UI; independent deploy)
- `ml-service` — Dedicated microservice for model inference / recommendations

This README gives a focused, practical guide to running and contributing to PathCrafter locally and in production.

---

## Quick highlights

- Express-based REST API with Helmet, compression, logging, rate limiting and robust error handling.
- MongoDB (Mongoose) for persistence.
- Graceful shutdown and proper signal handling for cloud deployments.
- ML microservice separation to keep model lifecycle independent of the API.

---

## Table of contents

- Quickstart (local)
- Environment variables (.env.example)
- Backend — start & example requests
- Frontend & ML service — quick run
- Production & deployment notes
- Tests & CI suggestions
- Contributing
- Files of interest

---

## Quickstart — Local development

Prerequisites
- Node.js >= 18
- npm (or yarn)
- MongoDB (local or remote connection string)

1. Clone the repo:
   git clone https://github.com/RishyendraRamakuri/PathCrafter.git
2. Backend:
   cd PathCrafter/backend
   npm install
   copy `../.env.example` → `backend/.env` and adjust values
   npm run dev
   - The backend defaults to port 5000 (or set PORT in the .env).
3. Frontend (if present):
   cd ../frontend
   npm install
   npm run dev
   - Check `frontend/package.json` for the exact dev script.
4. ML service:
   cd ../ml-service
   npm install
   npm run dev
   - Configure ML_SERVICE_URL in backend env to point to this service.

---

## Environment variables

Create `backend/.env` (or set environment variables in your deployment pipeline). Below is a concrete .env example; see the `.env.example` file shipped with this repo.

Required / recommended variables:
- MONGO_URI — full MongoDB connection string (example: mongodb://localhost:27017/pathcrafter)
- NODE_ENV — `development` | `production`
- PORT — server port (default 5000)
- FRONTEND_URL — production client URL (used for CORS)
- JWT_SECRET — secret for signing JWTs
- ML_SERVICE_URL — optional, URL for ML microservice (example: http://localhost:8000)

Security note: Never commit secrets to git. Use CI/CD secret stores or environment configuration in hosting services.

---

## Backend — start & example requests

Start (backend):
- Development (watch): cd backend && npm run dev
- Production: cd backend && npm start

Health check:
- GET http://localhost:5000/health

Example:
curl -sS http://localhost:5000/health | jq
Success response (example)
{
  "success": true,
  "message": "PathCrafter API is running",
  "timestamp": "2026-02-03T12:34:56.789Z",
  "environment": "development"
}

Root endpoint:
- GET http://localhost:5000/
- Response:
{
  "success": true,
  "message": "PathCrafter Backend API",
  "status": "running"
}

Example API request (public list / learning-paths — adjust to your routes and auth requirements):
curl -X GET 'http://localhost:5000/api/learning-paths' -H 'Accept: application/json'

Authentication-protected endpoints:
- The backend uses JWTs. Provide `Authorization: Bearer <token>` header for protected endpoints.
- Example:
curl -X GET 'http://localhost:5000/api/users/me' -H 'Authorization: Bearer <JWT>' -H 'Accept: application/json'

Error handling
- Validation errors: 400 with an `errors` array from Mongoose validation.
- Duplicate keys (unique index): 400 with message like `<field> already exists`.
- JWT errors: 401 (invalid or expired token).

---

## Frontend & ML service — quick run

Frontend:
- cd frontend
- npm install
- npm run dev
- For production builds: npm run build (and serve the build with your chosen host or CDN)

ML service:
- cd ml-service
- npm install
- npm run dev
- Configure `ML_SERVICE_URL` in the backend `.env` to enable API → ML integration.

If any `package.json` uses different scripts, prefer the script names defined there. (Backend `package.json` contains `start` → node server.js and `dev` → nodemon server.js.)

---

## Production & deployment notes

- Make sure `FRONTEND_URL` is set in production to restrict allowed CORS origins.
- Set `NODE_ENV=production` and run `npm start` (or containerize with Docker for consistent environment).
- Ensure your hosting provider sets environment variables (MONGO_URI, JWT_SECRET, ML_SERVICE_URL).
- Recommended: run behind HTTPS, enable monitoring, and keep JWT secrets rotated periodically.
- The backend sets `app.set('trust proxy', 1)` to support reverse proxies (Render, Vercel, Heroku etc.) and handles SIGINT / SIGTERM to gracefully close connections.

Suggested Docker & deployment improvements:
- Provide a Dockerfile for each service and a docker-compose.yml for local orchestration.
- Add health checks and readiness probes for production orchestrators (Kubernetes, ECS).

---

## Tests & CI

- There are no automated tests in the backend package yet. I recommend:
  - Unit tests: Jest
  - Integration tests (API): Supertest
  - E2E (frontend flows): Cypress
- Add a GitHub Actions workflow that:
  - installs deps,
  - runs lint & tests,
  - optionally builds frontend and runs integration smoke tests.

---

## Contributing

1. Fork -> branch -> commit -> PR.
2. Keep PRs small and focused. Describe:
   - What changed
   - Why it changed
   - How to test the change locally
3. Add tests for new features or regressions.
4. Follow consistent code style (prettier / eslint recommended).

---

## Files of interest

- backend/server.js — primary server entry and global middleware (security, logging, rate-limiting, error handling).
- backend/config — environment / config helpers.
- backend/routes — API route definitions (users, learning-paths, ml).
- backend/models — Mongoose models (data schema).
- frontend — UI client (see `frontend/package.json`).
- ml-service — model server for recommendations.

---

## Roadmap / suggested next steps (concrete)

- Add OpenAPI (Swagger) documentation for each endpoint (backend).
- Add unit & integration tests and GitHub Actions CI pipeline.
- Add Dockerfiles and a docker-compose for local dev.
- Add role-based access controls and pagination for larger learning-path lists.
- Implement logging to a structured log store (e.g., LogDNA / Datadog) for production.

---

## License

This repository should include a LICENSE file. The backend package lists ISC; please confirm at the repository root and add a LICENSE if not present.

---