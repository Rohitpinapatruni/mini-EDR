import threading
import time

from ..collectors.process_collector import get_all_processes
from ..detection.engine import calculate_risk
from ..database import SessionLocal
from ..models import Process, Alert


class ProcessMonitor:

    def __init__(self):

        self.running = False

        self.known_processes = set()

    def start(self):

        if self.running:
            return

        self.running = True

        thread = threading.Thread(
            target=self._monitor,
            daemon=True
        )

        thread.start()

    def stop(self):

        self.running = False

    def _monitor(self):

        while self.running:

            try:

                processes = get_all_processes()

                current_pids = {
                    p["pid"]
                    for p in processes
                }

                # Detect newly created processes

                new_pids = (
                    current_pids -
                    self.known_processes
                )

                for process in processes:

                    if process["pid"] not in new_pids:
                        continue

                    self.analyze_process(process)

                self.known_processes = current_pids

            except Exception as e:

                print("Monitor error:", e)

            time.sleep(2)

    def analyze_process(self, process):

        result = calculate_risk(process)

        process["risk_score"] = result["score"]

        process["risk_level"] = result["level"]

        db = SessionLocal()

        try:

            db_process = Process(

                pid=process["pid"],

                name=process["name"],

                exe_path=process["exe_path"],

                parent_pid=process["parent_pid"],

                username=process["username"],

                sha256=process["sha256"],

                cpu_percent=str(
                    process["cpu_percent"]
                ),

                memory_percent=str(
                    process["memory_percent"]
                ),

                risk_score=process["risk_score"],

                risk_level=process["risk_level"]

            )

            db.add(db_process)

            # Create alerts for medium/high findings

            if result["findings"]:

                for finding in result["findings"]:

                    alert = Alert(

                        pid=process["pid"],

                        process_name=process["name"],

                        rule=finding["reason"],

                        severity=process["risk_level"],

                        score=finding["score"],

                        description=finding["reason"]

                    )

                    db.add(alert)

            db.commit()

        finally:

            db.close()


monitor = ProcessMonitor()