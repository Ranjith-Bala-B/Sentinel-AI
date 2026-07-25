"""Structured logging helper shared by every Catalyst function.

Emits single-line JSON so Catalyst Logs (and any downstream log
aggregator) can parse fields without custom regex.
"""
import json
import logging
import sys
import time


def get_logger(service_name: str) -> logging.Logger:
    logger = logging.getLogger(service_name)
    if logger.handlers:
        return logger

    handler = logging.StreamHandler(sys.stdout)

    class JsonFormatter(logging.Formatter):
        def format(self, record: logging.LogRecord) -> str:
            payload = {
                "ts": int(time.time() * 1000),
                "service": service_name,
                "level": record.levelname,
                "message": record.getMessage(),
            }
            if record.exc_info:
                payload["exc_info"] = self.formatException(record.exc_info)
            return json.dumps(payload)

    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger
