import sys
import os
from pathlib import Path

# Ensure crimevision-fastapi root is in sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import uvicorn

port = int(os.environ.get("X_CATALYST_PORT") or os.environ.get("PORT") or "8080")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port
    )
