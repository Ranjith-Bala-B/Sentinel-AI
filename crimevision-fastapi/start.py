import sys
import os
import platform
import traceback
from pathlib import Path

# 1. Resolve base directory and bundled dependencies
BASE_DIR = Path(__file__).resolve().parent
deps_dir = BASE_DIR / "dependencies"

print(f"[STARTUP INFO] Python version: {sys.version}")
print(f"[STARTUP INFO] BASE_DIR: {BASE_DIR}")
print(f"[STARTUP INFO] Env X_CATALYST_PORT={os.environ.get('X_CATALYST_PORT')}, PORT={os.environ.get('PORT')}")

# 2. Add bundled Linux dependencies if running on Linux / container environment
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

# 4. Import FastAPI app with diagnostic logging
try:
    import uvicorn
    from main import app
    print("[STARTUP SUCCESS] Successfully imported uvicorn and main:app")
except Exception as exc:
    print(f"[STARTUP FATAL] Failed to import uvicorn or main:app: {exc}")
    traceback.print_exc()

# 5. Determine dynamic container listening port (default 9000 for AppSail proxy routing)
catalyst_port = os.environ.get("X_CATALYST_PORT") or os.environ.get("PORT") or "9000"
try:
    port = int(catalyst_port)
except ValueError:
    port = 9000

if __name__ == "__main__":
    print(f"[STARTUP INFO] Launching Uvicorn on 0.0.0.0:{port}...")
    try:
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=port,
            log_level="info",
            access_log=True
        )
    except Exception as run_exc:
        print(f"[STARTUP FATAL] Uvicorn runtime error: {run_exc}")
        traceback.print_exc()
