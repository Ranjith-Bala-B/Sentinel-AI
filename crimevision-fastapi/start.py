import sys
import os
import platform
from pathlib import Path

# 1. Resolve base directory
BASE_DIR = Path(__file__).resolve().parent
deps_dir = BASE_DIR / "dependencies"

# 2. Add bundled Linux dependencies if on Linux / AppSail container environment
if platform.system().lower() != "windows":
    if os.path.exists(deps_dir) and str(deps_dir) not in sys.path:
        sys.path.insert(0, str(deps_dir))

# 3. Add potential container package directories to sys.path
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

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import uvicorn
from main import app

# 4. Read dynamic port provided by Zoho Catalyst AppSail container
catalyst_port = os.environ.get("X_CATALYST_PORT") or os.environ.get("PORT") or "8080"
try:
    port = int(catalyst_port)
except ValueError:
    port = 8080

if __name__ == "__main__":
    print(f"Launching Sentinel AI FastAPI on 0.0.0.0:{port}...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )
