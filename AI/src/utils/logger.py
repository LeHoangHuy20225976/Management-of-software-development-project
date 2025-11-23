"""
Logging configuration for the application
Uses python-json-logger for structured JSON logging
"""
import logging
import sys
from pathlib import Path
from typing import Optional

from pythonjsonlogger import jsonlogger

from src.infrastructure.config import get_settings

settings = get_settings()


class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """
    Custom JSON formatter to add extra fields
    """

    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)

        # Add custom fields
        log_record["app"] = settings.app_name
        log_record["environment"] = settings.environment
        log_record["level"] = record.levelname
        log_record["logger_name"] = record.name
        log_record["module"] = record.module
        log_record["function"] = record.funcName
        log_record["line"] = record.lineno


def setup_logger(
    name: str = "hotel-ai",
    log_level: Optional[str] = None,
    log_file: Optional[Path] = None,
    json_format: bool = True,
) -> logging.Logger:
    """
    Setup and configure logger

    Args:
        name: Logger name
        log_level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional file path to write logs
        json_format: Use JSON format (True) or plain text (False)

    Returns:
        Configured logger instance

    Example:
        from src.utils.logger import setup_logger

        logger = setup_logger("my-service", log_level="DEBUG")
        logger.info("Service started", extra={"port": 8000})
        logger.error("Connection failed", extra={"host": "db", "error": str(e)})
    """
    # Get log level from settings if not provided
    level = log_level or settings.log_level
    log_level_value = getattr(logging, level.upper(), logging.INFO)

    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(log_level_value)
    logger.handlers.clear()  # Clear existing handlers

    # Create formatter
    if json_format:
        # JSON formatter for production
        formatter = CustomJsonFormatter(
            "%(timestamp)s %(level)s %(name)s %(message)s",
            timestamp=True,
        )
    else:
        # Plain text formatter for development
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    # Console handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level_value)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File handler (optional)
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(log_level_value)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    # Prevent propagation to root logger
    logger.propagate = False

    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get logger instance by name
    If logger doesn't exist, create it with default settings

    Args:
        name: Logger name (typically __name__ of the module)

    Returns:
        Logger instance

    Example:
        from src.utils.logger import get_logger

        logger = get_logger(__name__)
        logger.info("Processing request")
    """
    logger = logging.getLogger(name)

    # If logger has no handlers, set it up
    if not logger.handlers:
        return setup_logger(
            name=name,
            log_level=settings.log_level,
            json_format=(settings.environment == "production"),
        )

    return logger


# ========== Pre-configured loggers ==========

# Main application logger
app_logger = setup_logger(
    name="hotel-ai",
    log_level=settings.log_level,
    json_format=(settings.environment == "production"),
)

# Access logger for API requests
access_logger = setup_logger(
    name="hotel-ai.access",
    log_level="INFO",
    json_format=(settings.environment == "production"),
)

# Error logger
error_logger = setup_logger(
    name="hotel-ai.error",
    log_level="ERROR",
    json_format=(settings.environment == "production"),
)


# ========== Utility functions ==========

def log_function_call(logger: logging.Logger):
    """
    Decorator to log function calls

    Example:
        from src.utils.logger import get_logger, log_function_call

        logger = get_logger(__name__)

        @log_function_call(logger)
        def process_data(data: dict):
            return data
    """

    def decorator(func):
        def wrapper(*args, **kwargs):
            logger.debug(
                f"Calling {func.__name__}",
                extra={"args": str(args)[:100], "kwargs": str(kwargs)[:100]},
            )
            try:
                result = func(*args, **kwargs)
                logger.debug(f"{func.__name__} completed successfully")
                return result
            except Exception as e:
                logger.error(
                    f"{func.__name__} failed",
                    extra={"error": str(e), "error_type": type(e).__name__},
                    exc_info=True,
                )
                raise

        return wrapper

    return decorator


def configure_third_party_loggers():
    """
    Configure log levels for third-party libraries
    Call this in main.py to reduce noise from external libraries
    """
    # Reduce noise from verbose libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("aio_pika").setLevel(logging.WARNING)
    logging.getLogger("aiormq").setLevel(logging.WARNING)

    # Keep important logs
    logging.getLogger("prefect").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)


if __name__ == "__main__":
    # Example usage
    logger = setup_logger("test-logger", log_level="DEBUG", json_format=False)

    logger.debug("This is a debug message")
    logger.info("This is an info message", extra={"user_id": 123})
    logger.warning("This is a warning message", extra={"threshold": 0.8})
    logger.error("This is an error message", extra={"error_code": "E001"})

    try:
        1 / 0
    except Exception as e:
        logger.exception("Exception occurred", extra={"operation": "divide"})
