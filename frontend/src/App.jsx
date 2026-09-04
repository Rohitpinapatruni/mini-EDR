import { useEffect, useState } from "react";
import {
  Activity, AlertTriangle, ChevronRight, Circle, Cpu,
  Database, Globe2, LoaderCircle, MemoryStick, Network, RefreshCw,
  Search, Shield, ShieldAlert, TerminalSquare, Zap,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function getEndpoint(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function StateMessage({ loading, error, empty, children }) {
  if (loading) return <div className="table-state"><LoaderCircle className="spin" size={20} /> Loading endpoint data...</div>;
  if (error) return <div className="table-state error-state"><AlertTriangle size={20} /> {error}</div>;
  if (empty) return <div className="table-state"><Database size={20} /> {children || "No records found."}</div>;
  return null;
}

function SectionHeader({ icon: Icon, eyebrow, title, count }) {
  return <div className="section-header"><div className="section-title"><div className="section-icon"><Icon size={17} /></div><div><span>{eyebrow}</span><h2>{title}</h2></div></div>{count !== undefined && <span className="record-count">{count} records</span>}</div>;
}

function MetricCard({ label, value, detail, tone, icon: Icon }) {
  return <article className={`metric-card ${tone}`}><div className="metric-top"><span>{label}</span><Icon size={16} /></div><strong>{value ?? "-"}</strong><small>{detail}</small><div className="metric-line" /></article>;
}

function RiskBars({ stats }) {
  const max = Math.max(stats.low || 0, stats.medium || 0, stats.high || 0, 1);
  return <div className="risk-bars">{[["HIGH", stats.high || 0, "red"], ["MEDIUM", stats.medium || 0, "amber"], ["LOW", stats.low || 0, "green"]].map(([label, value, tone]) => <div className="risk-row" key={label}><div><span className={tone}>{label}</span><strong>{value}</strong></div><div className="bar-track"><span className={`bar-fill ${tone}`} style={{ width: `${Math.max((value / max) * 100, value ? 5 : 0)}%` }} /></div></div>)}</div>;
}

function ActivityChart({ processes }) {
  const points = processes.slice(0, 24).map((process) => Math.min(Number(process.cpu_percent) || 0, 100));
  const chartPoints = points.length ? points : [0];
  const max = Math.max(...chartPoints, 1);
  return <div className="activity-chart"><div className="chart-labels"><span>PROCESS CPU ACTIVITY</span><span>{points.length ? "24 latest readings" : "Awaiting telemetry"}</span></div><div className="bars">{chartPoints.map((point, index) => <span key={`${index}-${point}`} className="activity-bar" style={{ height: `${Math.max((point / max) * 100, point ? 8 : 2)}%` }} title={`${point}% CPU`} />)}</div><div className="chart-axis"><span>LOW</span><span>RELATIVE CPU UTILIZATION</span><span>HIGH</span></div></div>;
}

function ProcessTable({ processes, loading, error, query, setQuery }) {
  const filtered = processes.filter((item) => `${item.name} ${item.pid} ${item.exe_path}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="panel process-panel"><SectionHeader icon={Cpu} eyebrow="LIVE TELEMETRY" title="Running processes" count={filtered.length} /><div className="toolbar"><div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search process, PID, or path" /></div><span className="muted-label">AUTO-COLLECTED</span></div><StateMessage loading={loading} error={error && !processes.length ? error : ""} empty={!filtered.length && !loading}>{query ? "No processes match your search." : "No running processes returned."}</StateMessage>{filtered.length > 0 && <div className="table-wrap scroll-table"><table><thead><tr><th>Process</th><th>PID</th><th>Parent PID</th><th>CPU</th><th>Memory</th><th>Executable path</th></tr></thead><tbody>{filtered.map((process) => <tr key={`${process.pid}-${process.name}`}><td><div className="process-name"><span className="process-dot" />{process.name || "Unknown"}</div></td><td className="mono">{process.pid}</td><td className="mono">{process.parent_pid ?? "-"}</td><td><span className="metric"><Cpu size={13} />{process.cpu_percent ?? "-"}%</span></td><td><span className="metric"><MemoryStick size={13} />{process.memory_percent ?? "-"}%</span></td><td className="path-cell" title={process.exe_path}>{process.exe_path || "-"}</td></tr>)}</tbody></table></div>}</section>;
}

function AlertsPanel({ alerts, loading, error }) {
  return <section className="panel"><SectionHeader icon={ShieldAlert} eyebrow="DETECTION ENGINE" title="Recent security events" count={alerts.length} /><StateMessage loading={loading} error={error && !alerts.length ? error : ""} empty={!alerts.length && !loading}>No security alerts detected.</StateMessage>{alerts.length > 0 && <div className="table-wrap"><table><thead><tr><th>Time</th><th>Severity</th><th>Process</th><th>Score</th><th>Event</th></tr></thead><tbody>{alerts.map((alert, index) => <tr key={`${alert.id || alert.pid}-${index}`}><td className="timestamp">{alert.created_at ? new Date(alert.created_at).toLocaleString() : "-"}</td><td><span className={`severity ${String(alert.severity || "").toLowerCase()}`}>{alert.severity || "-"}</span></td><td><strong>{alert.process_name || "Unknown"}</strong><small className="table-sub">PID {alert.pid ?? "-"}</small></td><td className="score">{alert.score ?? "-"}</td><td className="description">{alert.description || "-"}</td></tr>)}</tbody></table></div>}</section>;
}

function NetworkPanel({ network, loading, error }) {
  return <section className="panel"><SectionHeader icon={Network} eyebrow="NETWORK VISIBILITY" title="Network activity" count={network.length} /><StateMessage loading={loading} error={error && !network.length ? error : ""} empty={!network.length && !loading}>No active network connections detected.</StateMessage>{network.length > 0 && <div className="table-wrap scroll-table"><table><thead><tr><th>Process</th><th>PID</th><th>Status</th><th>Local address</th><th>Remote endpoint</th></tr></thead><tbody>{network.map((connection, index) => <tr key={`${connection.pid}-${connection.local_address}-${index}`}><td><div className="process-name"><Globe2 size={15} className="network-icon" />{connection.process_name || "Unknown"}</div></td><td className="mono">{connection.pid}</td><td><span className="status"><span />{connection.status || "-"}</span></td><td className="mono">{connection.local_address || "-"}</td><td className="mono">{connection.remote_ip ? `${connection.remote_ip}:${connection.remote_port ?? "-"}` : "-"}</td></tr>)}</tbody></table></div>}</section>;
}

function Dashboard() {
  const [data, setData] = useState({ stats: null, processes: [], alerts: [], network: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  async function loadData() {
    setLoading(true); setError("");
    try {
      const [stats, processes, alerts, network, history] = await Promise.all([getEndpoint("/stats"), getEndpoint("/processes"), getEndpoint("/alerts"), getEndpoint("/network"), getEndpoint("/history")]);
      setData({ stats, processes, alerts, network, history }); setLastUpdated(new Date());
    } catch (requestError) { setError(`Cannot connect to FastAPI backend. ${requestError.message}`); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);
  const stats = data.stats || {};
  const avgCpu = data.processes.length ? (data.processes.reduce((sum, item) => sum + (Number(item.cpu_percent) || 0), 0) / data.processes.length).toFixed(1) : null;
  const processMemory = data.processes.length ? data.processes.reduce((sum, item) => sum + (Number(item.memory_percent) || 0), 0).toFixed(1) : null;

  return <><header className="topbar"><div className="brand"><div className="brand-mark"><Shield size={22} /></div><div><strong>MINI<span>-EDR</span></strong><small>Endpoint defense console</small></div></div><div className="topbar-meta"><span className="live-indicator"><Circle size={9} fill="currentColor" /> TELEMETRY ONLINE</span><span className="updated">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Awaiting telemetry"}</span><button className="icon-button" onClick={loadData} aria-label="Refresh telemetry" title="Refresh telemetry"><RefreshCw size={17} className={loading ? "spin" : ""} /></button></div></header><main className="shell"><div className="intro"><div><div className="breadcrumb"><span>SECURITY OPERATIONS</span><ChevronRight size={13} /><span>SINGLE ENDPOINT</span></div><h1>Endpoint command view</h1><p>Live telemetry, detection signals, and network activity from this Windows host.</p></div><div className="host-chip"><TerminalSquare size={16} /><span>LOCAL HOST</span><b>127.0.0.1</b></div></div>{error && <div className="connection-banner"><AlertTriangle size={18} /><span>{error}</span><button onClick={loadData}>Retry</button></div>}<div className="overview-heading"><div><span className="section-kicker">SYSTEM OVERVIEW</span><h2>Host activity at a glance</h2></div><span className="telemetry-badge"><Zap size={13} /> LIVE COLLECTION</span></div><section className="metrics-grid"><MetricCard label="Avg process CPU" value={avgCpu === null ? null : `${avgCpu}%`} detail="Across running processes" tone="cyan" icon={Cpu} /><MetricCard label="Process memory" value={processMemory === null ? null : `${processMemory}%`} detail="Combined process footprint" tone="amber" icon={MemoryStick} /><MetricCard label="Processes analyzed" value={stats.total} detail={`${stats.high || 0} high-risk detections`} tone="red" icon={ShieldAlert} /><MetricCard label="Connections" value={data.network.length} detail="Active inet connections" tone="green" icon={Network} /></section><div className="feature-grid"><section className="panel activity-panel"><SectionHeader icon={Activity} eyebrow="PROCESS SIGNAL" title="Activity profile" /><ActivityChart processes={data.processes} /></section><section className="panel risk-panel"><SectionHeader icon={ShieldAlert} eyebrow="SECURITY STATUS" title="Risk distribution" /><RiskBars stats={stats} /><div className="risk-total"><span><span className="legend-dot cyan" />Total analyzed</span><strong>{stats.total ?? "-"}</strong></div></section></div><AlertsPanel alerts={data.alerts} loading={loading} error={error} /><ProcessTable processes={data.processes} loading={loading} error={error} query={query} setQuery={setQuery} /><NetworkPanel network={data.network} loading={loading} error={error} /></main><footer><span><Shield size={14} /> MINI-EDR CONSOLE</span><span>FastAPI telemetry bridge <b>v1.0</b></span></footer></>;
}

export default function App() { return <Dashboard />; }
