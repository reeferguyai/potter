# PostgreSQL migration readiness

Target database: pothub
Target application role: potgrowhub

The repository remains ORM-free. Production migrations are SQL-first and must be executed through the deployment or operations layer.

Core entities: users, conversations, messages, knowledge_documents, suppliers, products, orders.

Required server configuration: DATABASE_URL, PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD.

Never commit production credentials.
