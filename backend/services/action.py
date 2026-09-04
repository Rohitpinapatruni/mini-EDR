import psutil

def terminate_process(pid: int) -> bool:
    """Attempt to terminate a process by PID."""
    try:
        proc = psutil.Process(pid)
        proc.terminate()
        # Wait a short time for it to terminate
        proc.wait(timeout=3)
        return True
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired):
        return False

