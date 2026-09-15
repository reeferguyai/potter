# Deployment-independent backend configuration

PotGrowHub backend is an ordinary Node.js/Express service and does not require a specific hosting provider.

Runtime variables:
- PORT=8787
- NODE_ENV=production
- DATABASE_URL=postgresql://potgrowhub:REDACTED@HOST:5432/pothub
- OPENAI_API_KEY=server-secret
- OPENAI_MODEL=gpt-5.5
- CORS_ORIGIN=https://potgrowhub.store

The frontend should call the public API origin through the deployment gateway or reverse proxy. Keep provider-specific settings outside application code.

Operational requirements:
1. TLS termination at the edge.
2. Secret injection through the host secret manager.
3. PostgreSQL connection pooling.
4. Health endpoint monitoring at /api/health.
5. Structured application logs.
6. Database backups and restore testing.
7. No Docker requirement.
8. No Prisma dependency.
