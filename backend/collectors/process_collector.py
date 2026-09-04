import psutil
import hashlib


def calculate_sha256(path):

    try:

        sha256 = hashlib.sha256()

        with open(path, "rb") as f:

            for chunk in iter(lambda: f.read(1024 * 1024), b""):
                sha256.update(chunk)

        return sha256.hexdigest()

    except Exception:
        return None


def get_process_info(proc):

    try:

        with proc.oneshot():

            pid = proc.pid

            name = proc.name()

            exe = proc.exe()

            parent_pid = proc.ppid()

            username = proc.username()

            cpu = proc.cpu_percent(interval=0.1)

            memory = proc.memory_percent()

            sha256 = calculate_sha256(exe) if exe else None

            try:
                cmdline = proc.cmdline()
                cmdline_str = " ".join(cmdline) if cmdline else ""
            except (psutil.AccessDenied, psutil.ZombieProcess):
                cmdline_str = ""

            return {
                "pid": pid,
                "name": name,
                "exe_path": exe,
                "cmdline": cmdline_str,
                "parent_pid": parent_pid,
                "username": username,
                "cpu_percent": round(cpu, 2),
                "memory_percent": round(memory, 2),
                "sha256": sha256
            }

    except (
        psutil.NoSuchProcess,
        psutil.AccessDenied,
        psutil.ZombieProcess
    ):

        return None


def get_all_processes():

    processes = []

    for proc in psutil.process_iter():

        info = get_process_info(proc)

        if info:
            processes.append(info)

    return processes