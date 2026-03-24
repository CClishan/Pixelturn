from __future__ import annotations

import signal
import subprocess
import sys
import time
from pathlib import Path


def _terminate(proc: subprocess.Popen[bytes]) -> None:
    if proc.poll() is not None:
        return
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()


def main() -> int:
    root = Path(__file__).resolve().parent
    frontend_dir = root / "image-converter-pro"

    if not frontend_dir.is_dir():
        print(f"Frontend directory not found: {frontend_dir}")
        return 1

    processes: list[subprocess.Popen[bytes]] = []

    try:
        backend = subprocess.Popen([sys.executable, "api_server.py"], cwd=root)
        processes.append(backend)

        frontend = subprocess.Popen(["npm", "run", "dev"], cwd=frontend_dir)
        processes.append(frontend)

        print("Backend and frontend started. Press Ctrl+C to stop both.")

        while True:
            backend_exit = backend.poll()
            frontend_exit = frontend.poll()

            if backend_exit is not None:
                print(f"Backend exited with code {backend_exit}.")
                return backend_exit
            if frontend_exit is not None:
                print(f"Frontend exited with code {frontend_exit}.")
                return frontend_exit

            time.sleep(0.5)

    except KeyboardInterrupt:
        print("\nStopping services...")
        return 0
    finally:
        for proc in reversed(processes):
            _terminate(proc)


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))
    raise SystemExit(main())
