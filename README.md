# Bakugan Arena Monorepo

Bakugan Arena is a multiplayer Bakugan battle simulator built as a monorepo. It includes a Next.js web client, a socket game server, a 3D gameboard viewer, and shared libraries for database schema and game logic.

## Links

- Community Discord: https://discord.gg/8HfPK5RVuk
- Live game: https://bakugan-arena.vercel.app/

## Repository Structure

- `apps/bakugan-arena/`: main Next.js application
  - `app/`: pages, dashboard, auth flows, and API routes
  - `components/`: UI components, auth pages, lobby, battlefield, deck builder, etc.
  - `src/lib/`: app-level utilities including auth and database clients
- `apps/bakugan-arena-server/`: standalone socket server for matchmaking and game state
  - `src/index.ts`: socket server entrypoint
  - `src/sockets/`: socket event handlers and match flow
  - `src/lib/`: database connection utilities
- `apps/gameboard-3d/`: Vite-powered 3D gameboard viewer
- `libs/drizzle-orm/`: shared Drizzle ORM schema and database definitions
- `libs/game-data/`: shared game logic, Bakugan data, rules, and card definitions

## Main Technologies

- `Next.js 15` with App Router
- `React 19`
- `TypeScript`
- `Tailwind CSS` v4
- `Drizzle ORM` for PostgreSQL schema and database access
- `better-auth` for authentication
- `Socket.IO` for real-time multiplayer
- `Express` for the socket server runtime
- `Neon` serverless Postgres driver support via `@neondatabase/serverless`
- `Zod` + `react-hook-form` for form validation
- `GSAP` animations and `three.js` / WebGL via the gameboard viewer

## Key Dependencies

- `better-auth`
- `drizzle-orm`
- `@neondatabase/serverless`
- `socket.io`, `socket.io-client`
- `next`, `react`, `react-dom`
- `zod`, `react-hook-form`
- `@radix-ui/*`
- `sonner`
- `zustand`
- `clsx`, `class-variance-authority`
- `gsap`
- `uuid`

## Local Setup

### 1. Install toolchain

```bash
pnpm install
```

### 2. Configure the database

This project expects a PostgreSQL-compatible database URL in `DATABASE_URL`.

You can use either:

- a local PostgreSQL instance
- a Neon database

Example local Postgres URL:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/bakugan_arena?sslmode=disable
```

Example Neon URL:

```bash
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require&channel_binding=require
```

### 3. Database and schema setup

The shared schema is defined in `libs/drizzle-orm`. The project currently uses Drizzle’s schema and database integration.

Because the app and server both rely on the same `DATABASE_URL`, you should make sure the database is reachable from both:

- `apps/bakugan-arena/src/lib/db.ts`
- `apps/bakugan-arena-server/src/lib/db.ts`
- `libs/drizzle-orm/drizzle.config.ts`

If you need to apply migrations, use the Drizzle CLI from the `libs/drizzle-orm` package with your `DATABASE_URL` set.

### 4. Environment variables

Create local env files for the Next app and the server.

#### `apps/bakugan-arena/.env.local`

```env
DATABASE_URL=postgresql://...your db url...
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3005
NEXT_PUBLIC_3D_GAMEBOARD_URL=http://localhost:4173
BLOB_READ_WRITE_TOKEN=your_blob_token_if_needed
```

#### `apps/bakugan-arena-server/.env`

```env
DATABASE_URL=postgresql://...your db url...
SOCKET_CORS_ORIGIN=http://localhost:3000
PORT=3005
```

> `NEXT_PUBLIC_BETTER_AUTH_URL` is used by `apps/bakugan-arena/src/lib/auth-client.ts`.
> `NEXT_PUBLIC_SOCKET_URL` is used by the web client socket provider.
> `NEXT_PUBLIC_3D_GAMEBOARD_URL` is used to load the 3D gameboard embed.
> `BLOB_READ_WRITE_TOKEN` is optional and only required when using blob upload features.

### 5. Auth setup with Better Auth

Authentication is implemented using `better-auth`:

- `apps/bakugan-arena/src/lib/auth.ts` configures `betterAuth` with the `drizzleAdapter` and `username` plugin
- `apps/bakugan-arena/app/api/auth/[...all]/route.ts` exposes the auth handler for Next.js
- `apps/bakugan-arena/src/lib/auth-client.ts` creates the client side auth client with `NEXT_PUBLIC_BETTER_AUTH_URL`

The database tables for auth are part of the shared schema in `libs/drizzle-orm/src/schema/auth-schema.ts`.

### 6. Start the application

Run the full development monorepo from the root:

```bash
pnpm dev
```

This will launch all defined `dev` scripts in workspaces.

If you want to run only a specific workspace:

```bash
pnpm --filter ./apps/bakugan-arena dev
pnpm --filter ./apps/bakugan-arena-server dev
pnpm --filter ./apps/gameboard-3d dev
```

### 7. Build commands

```bash
pnpm --filter @bakugan-arena/game-data build
pnpm --filter @bakugan-arena/drizzle-orm build
pnpm --filter ./apps/bakugan-arena build
pnpm --filter ./apps/bakugan-arena-server build
```

## Project Architecture

- `apps/bakugan-arena`: client-facing dashboard and battle interface
- `apps/bakugan-arena-server`: real-time game server and matchmaking logic
- `apps/gameboard-3d`: dedicated 3D viewer for the gameboard experience
- `libs/drizzle-orm`: shared schema, auth tables, game tables and database model definitions
- `libs/game-data`: shared game rules, Bakugan card definitions, ability logic, and replay logic

## Notes

- `apps/bakugan-arena/next.config.ts` enables `authInterrupts` for Next.js auth behavior.
- The socket server allows CORS origins configured through `SOCKET_CORS_ORIGIN`.
- The repository uses a monorepo architecture managed by `pnpm`.
- All runtime TypeScript is compiled from the workspace packages before the app and server start.

## Useful Commands

- `pnpm install`
- `pnpm dev`
- `pnpm --filter ./apps/bakugan-arena dev`
- `pnpm --filter ./apps/bakugan-arena-server dev`
- `pnpm --filter @bakugan-arena/drizzle-orm build`
- `pnpm --filter @bakugan-arena/game-data build`
