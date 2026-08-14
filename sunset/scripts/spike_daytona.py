"""
Step 0 hard gate: prove a Daytona sandbox round-trip works end to end
before any engine code depends on it.

Proves, in order:
  1. Client constructs from DAYTONA_API_KEY (via .env)
  2. Sandbox creates
  3. A local file uploads into it
  4. It executes, with stdout/stderr/exit-code captured SEPARATELY
     (via shell redirection to files, not process.exec()'s merged stream)
  5. Files written by the script are read back out
  6. Sandbox destroys

Also resolves the Python 2 image question: tries python:2.7-slim first,
reports pass/fail so the 45-minute cutoff decision can be made early.

Usage:
    .venv\\Scripts\\python scripts\\spike_daytona.py
"""

import asyncio
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from daytona import AsyncDaytona, CreateSandboxFromImageParams, Resources  # noqa: E402

RUN_DIR = "/tmp/sunset_spike"

# Redirect stdout/stderr/exit-code to separate files inside the sandbox.
# process.exec() only returns a merged stream (see research: ExecuteResponse
# has no separate stderr field) -- this sidesteps that entirely and gives
# byte-exact streams, which is what the differ actually needs.
RUN_CMD = (
    f"mkdir -p {RUN_DIR} && cd {RUN_DIR} && "
    f"python script.py > out.stdout 2> out.stderr; "
    f"echo -n $? > out.rc"
)


async def probe_image(daytona: AsyncDaytona, image: str, label: str) -> bool:
    print(f"\n--- probing image: {image} ({label}) ---")
    t0 = time.monotonic()
    sandbox = None
    try:
        sandbox = await daytona.create(
            CreateSandboxFromImageParams(
                image=image,
                resources=Resources(cpu=1, memory=1, disk=3),
                auto_stop_interval=5,
                auto_delete_interval=0,
            ),
            timeout=120,
        )
        create_s = time.monotonic() - t0
        print(f"  sandbox created in {create_s:.1f}s  (id={sandbox.id})")

        script = b'import sys\nprint("hello from " + sys.version)\nsys.stderr.write("err-line\\n")\nsys.exit(3)\n'
        await sandbox.fs.upload_file(script, f"{RUN_DIR}/script.py")
        print("  script uploaded")

        exec_t0 = time.monotonic()
        await sandbox.process.exec(f"bash -lc '{RUN_CMD}'", timeout=60)
        print(f"  exec finished in {time.monotonic() - exec_t0:.1f}s")

        stdout = (await sandbox.fs.download_file(f"{RUN_DIR}/out.stdout")).decode()
        stderr = (await sandbox.fs.download_file(f"{RUN_DIR}/out.stderr")).decode()
        rc = int((await sandbox.fs.download_file(f"{RUN_DIR}/out.rc")).decode())

        print(f"  stdout: {stdout!r}")
        print(f"  stderr: {stderr!r}")
        print(f"  exit_code: {rc}")

        ok = "hello from" in stdout and "err-line" in stderr and rc == 3
        print(f"  RESULT: {'PASS' if ok else 'FAIL'}")
        return ok
    except Exception as e:
        print(f"  RESULT: FAIL ({type(e).__name__}: {e})")
        return False
    finally:
        if sandbox is not None:
            try:
                await sandbox.delete()
                print(f"  sandbox destroyed (total wall time {time.monotonic() - t0:.1f}s)")
            except Exception as e:
                print(f"  WARNING: failed to destroy sandbox {sandbox.id}: {e}")


async def main() -> None:
    async with AsyncDaytona() as daytona:
        modern_ok = await probe_image(daytona, "python:3.12-slim", "modern runtime, control case")
        py27_ok = await probe_image(daytona, "python:2.7-slim", "legacy runtime, THE open question")

    print("\n=== SUMMARY ===")
    print(f"python:3.12-slim : {'PASS' if modern_ok else 'FAIL'}")
    print(f"python:2.7-slim  : {'PASS' if py27_ok else 'FAIL'}")

    if not modern_ok:
        print("\nHARD GATE FAILED on the control case. Nothing downstream works yet.")
        print("Check DAYTONA_API_KEY in sunset/.env and network access.")
        sys.exit(1)

    if py27_ok:
        print("\nPython 2 sandbox WORKS. Proceed with true Python 2 -> 3 fixtures.")
    else:
        print("\nPython 2 sandbox FAILED. Per the plan's fallback ladder:")
        print("  Rung 3: try debian:bullseye-slim + apt-get install -y python2")
        print("  Rung 4: drop true Python 2, reframe fixtures as legacy-style Python 3.6")
        print("          vs modern Python 3.12. Product thesis is unaffected.")
        print("Do not spend more than 45 minutes total on this before deciding.")


if __name__ == "__main__":
    asyncio.run(main())
