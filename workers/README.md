# Workers

Background jobs are isolated from the HTTP API. Each subdirectory owns one job domain and should expose an idempotent, observable worker entry point.
