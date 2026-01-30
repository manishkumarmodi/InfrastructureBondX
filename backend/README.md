# InfraBondX Backend

TypeScript/Express service that persists real investor, issuer, and admin workflows on MongoDB Atlas.

## Tech stack

- Express with TypeScript and `express-async-errors`
- MongoDB Atlas via Mongoose
- JSON Web Tokens for role-based auth
- Zod runtime validation

## Getting started

1. Copy `.env.example` to `.env` and keep the provided Atlas URI:
   ```bash
   cd backend
   cp .env.example .env
   # update JWT_SECRET with a strong random string
   ```
2. Install dependencies and run the dev server:
   ```bash
   npm install
   npm run dev
   ```
   The API serves at `http://localhost:5000` by default.

## Core collections

| Model      | Purpose |
|------------|---------|
| `User`     | Stores investors, issuers, and admins with hashed credentials and KYC state.
| `Project`  | Issuer-managed infrastructure assets with milestones and escrow data.
| `Investment` | Atomic transactions linking investors to projects, used to derive holdings/portfolio.
| `ProjectSubmission` | Draft submissions awaiting admin review before becoming live projects.

## Primary endpoints

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/projects`, `POST /api/projects`, milestone CRUD
- `POST /api/investors/investments`, `GET /api/investors/:id/portfolio`, `GET /api/investors/:id/transactions`
- `GET /api/issuers/:id/summary`, `GET /api/issuers/:id/projects`, `POST /api/issuers/submissions`
- `GET /api/admin/summary`, admin approvals approve/reject

Provide the `Authorization: Bearer <token>` header from auth endpoints to access protected routes. Frontend screens can now replace mock data by hitting these APIs.
