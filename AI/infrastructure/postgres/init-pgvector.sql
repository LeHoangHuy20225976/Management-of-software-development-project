-- Enable pgvector extension on all databases
-- This script runs after init-db.sql

\c prefect_db;
CREATE EXTENSION IF NOT EXISTS vector;

\c grafana_db;
CREATE EXTENSION IF NOT EXISTS vector;

\c mlflow_db;
CREATE EXTENSION IF NOT EXISTS vector;

\c vector_db;
CREATE EXTENSION IF NOT EXISTS vector;

-- Switch back to default database
\c hotel_db;
CREATE EXTENSION IF NOT EXISTS vector;
