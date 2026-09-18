# Repository layout

PotGrowHub is organized as a workspace monorepo. `apps/web` delivers the public application, `apps/admin` contains administrative surfaces, and `apps/api`/`server` define API boundaries. `workers` owns asynchronous processing. Reusable implementations belong in `packages`; stable frontend/backend contracts belong in `shared`.

Database changes are reproducible through `db/migrations` and deterministic seeds in `db/seeds`. The legacy `database` tree remains available for existing schema material during migration.

## Ownership rules

- Do not import web UI code into server or worker code.
- Make API payload changes in `shared/contracts` and validation changes in `shared/validation`.
- Keep model binaries out of Git; record model metadata in `models/manifests`.
- Put deployable infrastructure configuration in `infrastructure` and automation in `scripts`.
