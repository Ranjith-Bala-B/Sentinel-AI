import sys
import os
import platform
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
deps_dir = BASE_DIR / "dependencies"

if platform.system().lower() != "windows":
    if os.path.exists(deps_dir) and str(deps_dir) not in sys.path:
        sys.path.insert(0, str(deps_dir))

for p in [
    "/catalyst/dependencies",
    "/app/dependencies",
    os.path.expanduser("~/.local/lib/python3.11/site-packages"),
    "/var/lang/lib/python3.11/site-packages"
]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import uvicorn
from main import app

catalyst_port = os.environ.get("X_CATALYST_PORT") or os.environ.get("PORT") or "8080"
try:
    port = int(catalyst_port)
except ValueError:
    port = 8080

if __name__ == "__main__":
    print(f"[INFO] Launching Sentinel AI FastAPI on host 0.0.0.0 and port {port}...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )
