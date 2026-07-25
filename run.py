import subprocess
import os
import sys
import time
import glob

def run_project():
    print("===================================")
    print("   Starting Crime Vision Project")
    print("===================================")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(base_dir, "crimevision-frontend")
    backend_dir = os.path.join(base_dir, "crimevision-fastapi")

    # Locate Node.js/npm in case it's not in the PATH (e.g. installed via winget user scope)
    node_in_path = False
    for path in os.environ.get("PATH", "").split(os.pathsep):
        if os.path.exists(os.path.join(path, "node.exe")) or os.path.exists(os.path.join(path, "node")):
            node_in_path = True
            break
            
    if not node_in_path:
        local_appdata = os.environ.get("LOCALAPPDATA", "")
        if local_appdata:
            winget_packages = os.path.join(local_appdata, "Microsoft", "WinGet", "Packages")
            node_paths = glob.glob(os.path.join(winget_packages, "OpenJS.NodeJS*/**/node.exe"), recursive=True)
            if node_paths:
                node_dir = os.path.dirname(node_paths[0])
                os.environ["PATH"] = node_dir + os.pathsep + os.environ.get("PATH", "")
                print(f"Adding Node/npm from winget to temporary PATH: {node_dir}")

    frontend_process = None
    backend_process = None

    try:
        # Start frontend
        print("\nStarting Frontend (Vite)...")
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        frontend_process = subprocess.Popen(
            f"{npm_cmd} run dev",
            cwd=frontend_dir,
            shell=True
        )

        # Start backend
        print("\nStarting Backend (FastAPI)...")
        # Ensure we run uvicorn as a module using the current python executable
        backend_process = subprocess.Popen(
            f'"{sys.executable}" -m uvicorn main:app --reload --port 8000',
            cwd=backend_dir,
            shell=True
        )

        print("\nServices are starting. Press Ctrl+C to stop both services.\n")
        
        # Keep the main script alive while processes run
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nShutting down services...")
        if frontend_process:
            frontend_process.terminate()
        if backend_process:
            backend_process.terminate()
        print("Shutdown complete.")

if __name__ == "__main__":
    run_project()
