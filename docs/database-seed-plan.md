# Seed readiness

Seed data is separated from production credentials and supplier secrets.

Initial seed domains:
- platform configuration
- knowledge metadata
- category metadata
- supplier validation states
- marketplace discovery records

Seed execution must be idempotent. Never seed real customer, payment, or private supplier data into source control.
