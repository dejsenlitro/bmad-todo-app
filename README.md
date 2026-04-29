# Todo App

A simple full-stack Todo application built with React, Fastify, and PostgreSQL.

## Tech Stack

- **Frontend:** React 19 + Vite 8 + TypeScript + Tailwind CSS v4
- **Backend:** Fastify 5 + TypeScript + Node.js 22
- **Database:** PostgreSQL 16
- **Testing:** Vitest + Playwright
- **Infrastructure:** Docker Compose

## Development

### Prerequisites

- Node.js 22+
- npm 10+

### Quick Start

```bash
# Install dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..

# Start frontend (port 5173)
cd client && npm run dev

# Start backend (port 3001) — in separate terminal
cd server && npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and adjust values as needed.

## Docker (Story 1.2)

```bash
docker-compose up
```

## Project Structure

```
todo-app/
├── client/          # React + Vite + Tailwind frontend
├── server/          # Fastify + TypeScript backend
├── e2e/             # Playwright E2E tests (Story 3.2)
├── db/              # Database init scripts (Story 1.2)
└── docker-compose.yml
```
