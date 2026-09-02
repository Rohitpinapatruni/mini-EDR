import psutil


def get_network_connections():

    results = []

    for conn in psutil.net_connections(kind="inet"):

        try:

            pid = conn.pid

            if not pid:
                continue

            process = psutil.Process(pid)

            process_name = process.name()

            remote_ip = None
            remote_port = None

            if conn.raddr:

                remote_ip = conn.raddr.ip
                remote_port = conn.raddr.port

            results.append({

                "pid": pid,

                "process_name": process_name,

                "status": conn.status,

                "local_address": str(conn.laddr),

                "remote_ip": remote_ip,

                "remote_port": remote_port

            })

        except (
            psutil.NoSuchProcess,
            psutil.AccessDenied
        ):

            continue

    return results