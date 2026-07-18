# Booking Webapp

Webapp di prenotazione eventi: API NestJS + Postgres/TypeORM (backend), SPA Vue 3 + PrimeVue (frontend).

## Struttura

```
backend/    NestJS API (auth JWT, events, bookings, notifications)
frontend/   Vue 3 SPA (Vite, TypeScript, PrimeVue, Pinia, vue-i18n)
```

## Architettura in breve

- **Backend**: modulare per dominio (`auth/`, `users/`, `events/`, `bookings/`, `notifications/`, `health/`). Ogni risposta HTTP (successo o errore) è avvolta in `{ success, errorMessage, data }`; gli errori applicativi usano codici macchina-leggibili (`ErrorCode` enum), mai testo libero — la traduzione avviene lato frontend.
- **Auth**: JWT via Passport, tutte le rotte protette di default (`JwtAuthGuard` globale), rotte pubbliche marcate `@Public()`.
- **Frontend**: layer API centralizzato (axios + interceptor che spacchetta l'envelope e mappa gli errori), stato in Pinia, routing con guard su `meta.requiresAuth`, i18n IT/EN con traduzione automatica degli `ErrorCode` dal backend.

## Come avviare il progetto

Servono entrambe le app in esecuzione per usare il flusso completo.

### Backend

**1. Installazione**

```bash
cd backend
npm install
```

**2. Configurazione ambiente**

`.env.development` / `.env.production` già presenti nel repo (preconfigurati per Docker locale su porta 5433). Modificali se serve — in particolare cambia `JWT_SECRET` prima di un deploy reale.

**3. Database (Postgres via Docker)**

```bash
docker compose up -d postgres
docker compose ps   # verifica stato
```

**4. Migrazioni**

```bash
npm run migration:run
```

**5. Avvio (sviluppo)**

```bash
npm run start:dev
```

App su `http://localhost:4500/api` (porta da `PORT` in `.env.development`).

- Swagger: `http://localhost:4500/swagger`
- Health check: `GET http://localhost:4500/api/health`


Altri comandi utili:

```bash
npm run migration:generate -- src/migrations/NomeMigrazione   # genera nuova migrazione
npm run migration:revert                                       # rollback ultima migrazione
```


**6. Test**

```bash
npm run test          # unit test
npm run test:e2e      # e2e (richiede Postgres attivo)
npm run test:cov      # coverage
```

**7. Build & avvio produzione**

```bash
npm run build
NODE_ENV=production npm run start:prod
```

**8. Tutto via Docker (app + db)**

```bash
docker compose up -d
```

Usa `.env.production` (mappato in `docker-compose.yml`). API esposta su porta `4500`.


### Frontend

**1. Installazione**

```bash
cd frontend
npm install
```

**2. Configurazione ambiente**

`.env.development` / `.env.production` già presenti. `VITE_API_BASE_URL=/api` — il dev server fa da proxy verso il backend su `http://localhost:4500` (vedi `vite.config.ts`), quindi il backend deve essere già avviato.

**3. Avvio (sviluppo)**

```bash
npm run dev
```

App su `http://localhost:5173`.

**4. Build & preview produzione**

```bash
npm run build     # type-check + build in dist/
npm run preview   # serve la build locale
```

**5. Lint & format**

```bash
npm run lint      # oxlint --fix + eslint --fix --cache
npm run format    # prettier --write src/
```


### Avvio completo (backend + frontend)

```bash
cd backend
docker compose up -d postgres
npm run migration:run
npm run start:dev

cd frontend
npm run dev
```

Poi apri `http://localhost:5173`.

## Note ambiente

- Postgres nativo eventualmente già attivo su 5432 → il container Docker usa la porta **5433** per evitare conflitti.
- Porta backend: **4500** (non la 3000 di default NestJS) — se cambi `PORT`, aggiorna anche il proxy in `frontend/vite.config.ts`.
