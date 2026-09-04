import { useState } from "react";
import { Cpu, Search, MemoryStick, XCircle } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { StateMessage } from "./StateMessage";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export function ProcessTable({ processes, loading, error, query, setQuery, onActionComplete }) {
  const [terminating, setTerminating] = useState(null);

  const filtered = processes.filter((item) => `${item.name} ${item.pid} ${item.exe_path} ${item.cmdline || ""}`.toLowerCase().includes(query.toLowerCase()));

  const handleTerminate = async (pid) => {
    if (!window.confirm(`Are you sure you want to terminate process ${pid}?`)) return;
    setTerminating(pid);
    try {
      const response = await fetch(`${API_URL}/processes/${pid}/terminate`, { method: "POST" });
      if (!response.ok) throw new Error("Termination failed");
      alert(`Process ${pid} terminated successfully.`);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert(err.message);
    } finally {
      setTerminating(null);
    }
  };

  return (
    <section className="panel process-panel">
      <SectionHeader icon={Cpu} eyebrow="LIVE TELEMETRY" title="Running processes" count={filtered.length} />
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search process, PID, path, or cmdline" />
        </div>
        <span className="muted-label">AUTO-COLLECTED</span>
      </div>
      <StateMessage loading={loading} error={error && !processes.length ? error : ""} empty={!filtered.length && !loading}>
        {query ? "No processes match your search." : "No running processes returned."}
      </StateMessage>
      {filtered.length > 0 && (
        <div className="table-wrap scroll-table">
          <table>
            <thead>
              <tr>
                <th>Process</th>
                <th>PID</th>
                <th>Parent PID</th>
                <th>CPU</th>
                <th>Memory</th>
                <th>Executable path</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((process) => (
                <tr key={`${process.pid}-${process.name}`}>
                  <td>
                    <div className="process-name">
                      <span className="process-dot" />{process.name || "Unknown"}
                    </div>
                  </td>
                  <td className="mono">{process.pid}</td>
                  <td className="mono">{process.parent_pid ?? "-"}</td>
                  <td>
                    <span className="metric"><Cpu size={13} />{process.cpu_percent ?? "-"}%</span>
                  </td>
                  <td>
                    <span className="metric"><MemoryStick size={13} />{process.memory_percent ?? "-"}%</span>
                  </td>
                  <td className="path-cell" title={`${process.exe_path}\n${process.cmdline || ""}`}>{process.exe_path || "-"}</td>
                  <td>
                    <button 
                      className="btn-danger" 
                      onClick={() => handleTerminate(process.pid)}
                      disabled={terminating === process.pid}
                      title="Terminate process"
                    >
                      {terminating === process.pid ? "..." : <XCircle size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

