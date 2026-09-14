# PotGrowHub Platform Upgrade

This branch layers the production architecture around the existing GanjaGroot orbital interface rather than replacing it.

## Stack
- Existing GanjaGroot orbital UI remains the visual front door.
- GanjaGuru is a server-side OpenAI Responses API service; the API key never belongs in browser code.
- Knowledge is organized as versioned documents and an index for retrieval.
- Ghost Commerce separates sourcing, validation, catalog, checkout, order, fulfillment and delivery concerns.
- PostgreSQL uses the `pothub` database and `potgrowhub` role convention.
- SEO/AEO/GEO assets point to `https://potgrowhub.store`.
- PWA remains deployment-agnostic; no Netlify-specific runtime dependency is introduced.

## Production gates
1. Configure backend environment variables.
2. Install backend dependencies.
3. Apply `database/schema/001_core.sql` to PostgreSQL.
4. Run the API and verify `/api/health`.
5. Connect the existing homepage chat to `/api/guru/chat`.
6. Add provider credentials only on the server.
7. Configure production deployment and HTTPS.
8. Run accessibility, performance, SEO, security and end-to-end checks.
