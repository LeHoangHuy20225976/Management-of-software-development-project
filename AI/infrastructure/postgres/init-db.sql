-- PostgreSQL initialization script for Hotel AI System
-- This script creates all required databases

-- Database: prefect_db (for Prefect workflow orchestration)
SELECT 'CREATE DATABASE prefect_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'prefect_db')\gexec

-- Database: grafana_db (for Grafana dashboards)
SELECT 'CREATE DATABASE grafana_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'grafana_db')\gexec

-- Database: mlflow_db (for MLflow experiment tracking)
SELECT 'CREATE DATABASE mlflow_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mlflow_db')\gexec

-- Database: vector_db (for vector embeddings from AI services)
SELECT 'CREATE DATABASE vector_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'vector_db')\gexec

-- Grant all privileges to hotel_user on all databases
GRANT ALL PRIVILEGES ON DATABASE prefect_db TO hotel_user;
GRANT ALL PRIVILEGES ON DATABASE grafana_db TO hotel_user;
GRANT ALL PRIVILEGES ON DATABASE mlflow_db TO hotel_user;
GRANT ALL PRIVILEGES ON DATABASE vector_db TO hotel_user;
