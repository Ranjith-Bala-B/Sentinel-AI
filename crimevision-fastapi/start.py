import sys
import os
from pathlib import Path

# 1. Resolve base directory and local dependencies directory
BASE_DIR = Path(__file__).resolve().parent
deps_dir = BASE_DIR / "dependencies"

if str(deps_dir) not in sys.path:
    sys.path.insert(0, str(deps_dir))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# 2. Add potential Catalyst container paths to sys.path
for p in [
    "/catalyst/dependencies",
    "/app/dependencies",
    os.path.expanduser("~/.local/lib/python3.11/site-packages"),
    os.path.expanduser("~/.local/lib/python3/site-packages"),
    "/var/lang/lib/python3.11/site-packages",
    "/var/lang/lib/python3/site-packages"
]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

import uvicorn

port = int(os.environ.get("X_CATALYST_PORT") or os.environ.get("PORT") or "8080")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port
    )
