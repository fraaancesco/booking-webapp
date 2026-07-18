# Come avviare il progetto

Due app indipendenti: `backend/` (NestJS API) e `frontend/` (Vue 3 SPA). Servono entrambe in esecuzione per usare l'app completa.

## Backend

### 1. Installazione

```bash
cd backend
npm install
```

### 2. Configurazione ambiente

`.env.development` / `.env.production` già presenti nel repo (preconfigurati per Docker locale su porta 5433). Modificali se serve.

### 3. Database (Postgres via Docker)

```bash
docker compose up -d postgres
```

Verifica che sia su:

```bash
docker compose ps
```

### 4. Migrazioni

```bash
npm run migration:run
```

Altri comandi utili:

```bash
npm run migration:generate -- src/migrations/NomeMigrazione   # genera nuova migrazione
npm run migration:revert                                       # rollback ultima migrazione
```

### 5. Avvio app (sviluppo)

```bash
npm run start:dev
```

App su `http://localhost:4500/api` (porta da `PORT` in `.env.development`).

- Swagger: `http://localhost:4500/swagger`
- Health check: `GET http://localhost:4500/api/health`

### 6. Test

```bash
npm run test          # unit test
npm run test:e2e      # e2e (richiede Postgres attivo)
npm run test:cov      # coverage
```

### 7. Build & avvio produzione

```bash
npm run build
NODE_ENV=production npm run start:prod
```

### 8. Tutto via Docker (app + db)

```bash
docker compose up -d
```

Usa `.env.production` (mappato in `docker-compose.yml`). API esposta su porta `4500`.

### Comandi rapidi di verifica

```bash
curl http://localhost:4500/api/health

curl -X POST http://localhost:4500/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123"}'

curl -X POST http://localhost:4500/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Frontend

### 1. Installazione

```bash
cd frontend
npm install
```

### 2. Configurazione ambiente

`.env.development` / `.env.production` già presenti. `VITE_API_BASE_URL=/api` — il dev server fa da proxy verso il backend su `http://localhost:4500` (vedi `vite.config.ts`), quindi il backend deve essere già avviato.

### 3. Avvio (sviluppo)

```bash
npm run dev
```

App su `http://localhost:5173`.

### 4. Build & preview produzione

```bash
npm run build     # type-check + build in dist/
npm run preview   # serve la build locale
```

### 5. Lint & format

```bash
npm run lint      # oxlint --fix + eslint --fix --cache
npm run format    # prettier --write src/
```

Nessun test runner configurato nel frontend.

## Avvio completo (backend + frontend)

```bash
# terminale 1
cd backend
docker compose up -d postgres
npm run migration:run
npm run start:dev

# terminale 2
cd frontend
npm run dev
```

Poi apri `http://localhost:5173`.
