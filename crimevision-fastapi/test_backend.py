import urllib.request
import json
import sys

BASE_URL = "https://sentinel-ai-backend-50044342253.development.catalystappsail.in"

endpoints = [
    "/",
    "/health",
    "/version",
    "/docs",
    "/openapi.json",
    "/dashboard/summary",
    "/crimes/summary",
    "/crimes/filters",
    "/insights/threats",
    "/geospatial/map-data",
    "/hotspots/density",
    "/networks/gangs",
    "/offenders/recidivism",
    "/predictions/forecast",
    "/sociological/demographics",
    "/investigator/dossier/OFF-2026-001",
    "/admin/audit-logs"
]

def test_all():
    print(f"Testing live AppSail backend: {BASE_URL}\n" + "="*50)
    passed = 0
    failed = 0

    for ep in endpoints:
        url = f"{BASE_URL}{ep}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Sentinel-AI-Tester"})
            with urllib.request.urlopen(req, timeout=10) as response:
                code = response.getcode()
                body = response.read().decode('utf-8')
                if code == 200:
                    print(f"[PASS] [200 OK] {ep}")
                    passed += 1
                else:
                    print(f"[FAIL] [{code}] {ep}")
                    failed += 1
        except Exception as exc:
            print(f"[FAIL] [ERROR] {ep}: {exc}")
            failed += 1

    print("="*50)
    print(f"Test Summary: {passed} PASSED, {failed} FAILED")
    return failed == 0

if __name__ == "__main__":
    success = test_all()
    sys.exit(0 if success else 1)
