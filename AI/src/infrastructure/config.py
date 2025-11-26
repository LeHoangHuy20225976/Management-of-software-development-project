"""
Configuration management using Pydantic Settings
Load environment variables from .env file
"""
from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, RedisDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ========== Application ==========
    app_name: str = Field(default="Hotel AI System", alias="APP_NAME")
    environment: Literal["development", "staging", "production"] = Field(
        default="development", alias="ENVIRONMENT"
    )
    debug: bool = Field(default=False, alias="DEBUG")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # ========== PostgreSQL ==========
    postgres_user: str = Field(default="hotel_user", alias="POSTGRES_USER")
    postgres_password: str = Field(default="hotel_password", alias="POSTGRES_PASSWORD")
    postgres_host: str = Field(default="postgres", alias="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, alias="POSTGRES_PORT")
    postgres_db: str = Field(default="hotel_db", alias="POSTGRES_DB")

    @computed_field
    @property
    def database_url(self) -> str:
        """PostgreSQL connection URL for SQLAlchemy"""
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    @computed_field
    @property
    def vector_db_url(self) -> str:
        """Vector database connection URL"""
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/vector_db"

    # ========== Redis ==========
    redis_host: str = Field(default="redis", alias="REDIS_HOST")
    redis_port: int = Field(default=6379, alias="REDIS_PORT")
    redis_password: str = Field(default="redis_password", alias="REDIS_PASSWORD")
    redis_db: int = Field(default=0, alias="REDIS_DB")

    @computed_field
    @property
    def redis_url(self) -> str:
        """Redis connection URL"""
        return f"redis://:{self.redis_password}@{self.redis_host}:{self.redis_port}/{self.redis_db}"

    # ========== RabbitMQ ==========
    rabbitmq_host: str = Field(default="rabbitmq", alias="RABBITMQ_HOST")
    rabbitmq_port: int = Field(default=5672, alias="RABBITMQ_PORT")
    rabbitmq_user: str = Field(default="hotel_user", alias="RABBITMQ_USER")
    rabbitmq_password: str = Field(default="rabbitmq_password", alias="RABBITMQ_PASSWORD")

    @computed_field
    @property
    def rabbitmq_url(self) -> str:
        """RabbitMQ connection URL"""
        return f"amqp://{self.rabbitmq_user}:{self.rabbitmq_password}@{self.rabbitmq_host}:{self.rabbitmq_port}/"

    # ========== MinIO (Object Storage) ==========
    minio_endpoint: str = Field(default="minio:9000", alias="MINIO_ENDPOINT")
    minio_access_key: str = Field(default="minio_admin", alias="MINIO_ACCESS_KEY")
    minio_secret_key: str = Field(default="minio_password_123", alias="MINIO_SECRET_KEY")
    minio_secure: bool = Field(default=False, alias="MINIO_SECURE")
    minio_bucket: str = Field(default="hotel-data", alias="MINIO_BUCKET")

    # ========== Prefect ==========
    prefect_api_url: str = Field(
        default="http://prefect-server:4200/api", alias="PREFECT_API_URL"
    )

    # ========== MLflow ==========
    mlflow_tracking_uri: str = Field(
        default="http://mlflow:5000", alias="MLFLOW_TRACKING_URI"
    )

    # ========== OpenAI / LLM ==========
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    anthropic_api_key: str = Field(default="", alias="ANTHROPIC_API_KEY")
    nvidia_api_key: str = Field(default="", alias="NVIDIA_API_KEY")
    llm_model: str = Field(default="openai/gpt-oss-120b", alias="LLM_MODEL")
    embedding_model: str = Field(default="text-embedding-3-small", alias="EMBEDDING_MODEL")
    embedding_dimension: int = Field(default=1536, alias="EMBEDDING_DIMENSION")

    # ========== API Settings ==========
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    api_workers: int = Field(default=1, alias="API_WORKERS")
    api_reload: bool = Field(default=True, alias="API_RELOAD")

    # ========== CORS ==========
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        alias="CORS_ORIGINS",
    )

    # ========== Security ==========
    secret_key: str = Field(default="change-this-secret-key-in-production", alias="SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance
    Use this function to get settings throughout the application

    Example:
        from src.infrastructure.config import get_settings

        settings = get_settings()
        print(settings.database_url)
    """
    return Settings()


# Convenience: Export settings instance directly
settings = get_settings()
