"""
Core engine: run a script inside a fresh, isolated Daytona sandbox and
capture stdout, stderr, and exit code SEPARATELY.

process.exec() only returns a merged stream (ExecuteResponse has no
stderr field) -- confirmed against the installed SDK, not assumed from
docs. Sessions expose separated streams but bring WebSocket lifecycle
management this build doesn't have time to debug. Instead: redirect to
files inside the sandbox and download them back as bytes. Byte-exact,
no interleaving nondeterminism, no session teardown.

One AsyncDaytona client is created per call site and reused across the
sandbox's lifetime, per the SDK's documented shared-WebSocket design
(each client opens one connection shared by all its sandboxes).
"""

from __future__ import annotations

import asyncio
import time
import uuid
from dataclasses import dataclass, field

from daytona import AsyncDaytona, CreateSandboxFromImageParams, Resources

RUN_DIR = "/tmp/sunset_run"


@dataclass
class RunResult:
    stdout: str
    stderr: str
    exit_code: int
    files: dict[str, str] = field(default_factory=dict)
    duration_ms: int = 0
    sandbox_id: str = ""


async def run_script(
    daytona: AsyncDaytona,
    image: str,
    script_bytes: bytes,
    input_files: dict[str, bytes] | None = None,
    output_filenames: list[str] | None = None,
    timeout: int = 60,
) -> RunResult:
    """
    Provision a fresh sandbox, upload the script (+ any input files),
    execute it, collect stdout/stderr/exit code and any named output
    files, then always destroy the sandbox -- even on failure.

    Sandboxes must be fresh on every call. Reusing one contaminates
    state from the previous run and invalidates the comparison.
    """
    input_files = input_files or {}
    output_filenames = output_filenames or []
    run_id = uuid.uuid4().hex[:8]
    run_dir = f"{RUN_DIR}_{run_id}"

    t0 = time.monotonic()
    sandbox = None
    try:
        sandbox = await daytona.create(
            CreateSandboxFromImageParams(
                image=image,
                resources=Resources(cpu=1, memory=1, disk=3),
                # crashed runs self-clean instead of burning quota
                auto_stop_interval=5,
                auto_delete_interval=0,
            ),
            timeout=90,
        )

        await sandbox.fs.create_folder(run_dir, "755")
        await sandbox.fs.upload_file(script_bytes, f"{run_dir}/script.py")
        for name, content in input_files.items():
            await sandbox.fs.upload_file(content, f"{run_dir}/{name}")

        cmd = (
            f"cd {run_dir} && "
            f"python script.py > out.stdout 2> out.stderr; "
            f"echo -n $? > out.rc"
        )
        await sandbox.process.exec(f"bash -lc '{cmd}'", timeout=timeout)

        stdout = (await sandbox.fs.download_file(f"{run_dir}/out.stdout")).decode(
            "utf-8", errors="replace"
        )
        stderr = (await sandbox.fs.download_file(f"{run_dir}/out.stderr")).decode(
            "utf-8", errors="replace"
        )
        exit_code = int((await sandbox.fs.download_file(f"{run_dir}/out.rc")).decode())

        files: dict[str, str] = {}
        for name in output_filenames:
            try:
                files[name] = (
                    await sandbox.fs.download_file(f"{run_dir}/{name}")
                ).decode("utf-8", errors="replace")
            except Exception:
                files[name] = ""  # candidate legitimately failed to write it

        return RunResult(
            stdout=stdout,
            stderr=stderr,
            exit_code=exit_code,
            files=files,
            duration_ms=int((time.monotonic() - t0) * 1000),
            sandbox_id=sandbox.id,
        )
    finally:
        if sandbox is not None:
            try:
                await sandbox.delete()
            except Exception:
                pass  # auto_stop_interval=5 is the backstop


async def run_pair(
    daytona: AsyncDaytona,
    legacy_image: str,
    legacy_script: bytes,
    modern_image: str,
    modern_script: bytes,
    input_files: dict[str, bytes] | None = None,
    output_filenames: list[str] | None = None,
    timeout: int = 60,
) -> tuple[RunResult, RunResult]:
    """Run the legacy and candidate scripts in two fresh sandboxes, in parallel."""
    legacy_task = run_script(
        daytona, legacy_image, legacy_script, input_files, output_filenames, timeout
    )
    modern_task = run_script(
        daytona, modern_image, modern_script, input_files, output_filenames, timeout
    )
    return await asyncio.gather(legacy_task, modern_task)
