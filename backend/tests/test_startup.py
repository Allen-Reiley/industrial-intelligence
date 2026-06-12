import subprocess
import time
import os
import signal

def test_startup_script_execution():
    """
    Executes the start.sh script and asserts that it runs the migrations
    and successfully triggers the ASGI server boot process before being terminated.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    start_sh_path = os.path.abspath(os.path.join(current_dir, "..", "start.sh"))
    assert os.path.exists(start_sh_path), f"start.sh not found at {start_sh_path}"
    
    # Run in the backend root directory
    backend_root = os.path.abspath(os.path.join(current_dir, ".."))
    
    # We pass a modified environment setting a dummy port and short-lived startup
    # to avoid binding to an active port or conflicting with active local servers.
    env = os.environ.copy()
    env["PORT"] = "8099"
    
    # Start start.sh in a subprocess
    process = subprocess.Popen(
        [start_sh_path],
        cwd=backend_root,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        preexec_fn=os.setsid,  # Start in a new process group to allow clean termination
        env=env
    )
    
    booted_server = False
    migration_ran = False
    
    start_time = time.time()
    timeout = 15  # 15 seconds timeout
    
    try:
        while True:
            if time.time() - start_time > timeout:
                break
                
            line = process.stdout.readline()
            if not line:
                break
                
            print(f"STDOUT: {line.strip()}")
            
            if "Running database migrations" in line:
                migration_ran = True
            if "Database migrations successfully applied" in line or "Database migrations failed to apply" in line:
                migration_ran = True
            if "Starting ASGI server" in line or "Uvicorn running on" in line:
                booted_server = True
                break
                
            # If the process exited early with an error code, stop
            if process.poll() is not None:
                break
    finally:
        # Cleanly terminate the subprocess and all its children
        try:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            process.wait(timeout=2)
        except Exception:
            pass
            
    assert migration_ran, "Migrations step did not run in start.sh"
    assert booted_server, "ASGI server did not trigger in start.sh"
