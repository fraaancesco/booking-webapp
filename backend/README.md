# Booking Webapp — Backend

API NestJS con autenticazione JWT, Postgres/TypeORM, health check e Swagger.

## Setup

```bash
npm install
docker compose up -d postgres
npm run migration:run
```

## Sviluppo

```bash
npm run start:dev
```

- API: `http://localhost:3000/api`
- Swagger (solo non-prod): `http://localhost:3000/swagger`
- Health check: `GET /api/health`

## Auth

- `POST /api/auth/register` — `{ email, password }`
- `POST /api/auth/login` — `{ email, password }` → `{ access_token }`
- Tutte le altre rotte richiedono `Authorization: Bearer <token>` salvo quelle marcate `@Public()`

## Migrazioni (TypeORM)

```bash
npm run migration:generate -- src/migrations/NomeMigrazione
npm run migration:run
npm run migration:revert
```

## Test

```bash
npm run test        # unit
npm run test:e2e    # e2e (richiede Postgres attivo)
npm run test:cov    # coverage
```

## Docker

`docker-compose.yml` avvia Postgres (porta 5433 sull'host per non collidere con un'istanza locale) e opzionalmente l'app via `Dockerfile` multi-stage.
