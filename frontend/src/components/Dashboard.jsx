import { useEffect, useState, useCallback, useRef } from "react";
import { Circle, ChevronRight, RefreshCw, TerminalSquare, Shield, AlertTriangle, Zap, Cpu, MemoryStick, ShieldAlert, Network } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { RiskBars } from "./RiskBars";
import { ActivityChart } from "./ActivityChart";
import { ProcessTable } from "./ProcessTable";
import { AlertsPanel } from "./AlertsPanel";
import { NetworkPanel } from "./NetworkPanel";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function getEndpoint(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

export function Dashboard() {
  const [data, setData] = useState({ stats: null, processes: [], alerts: [], network: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true); 
    setError("");
    try {
      const [stats, processes, alerts, network, history] = await Promise.all([
        getEndpoint("/stats"), 
        getEndpoint("/processes"), 
        getEndpoint("/alerts"), 
        getEndpoint("/network"), 
        getEndpoint("/history")
      ]);
      setData({ stats, processes, alerts, network, history }); 
      setLastUpdated(new Date());
    } catch (requestError) { 
      setError(`Cannot connect to FastAPI backend. ${requestError.message}`); 
    } finally { 
      if (!isBackground) setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  useEffect(() => {
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        loadData(true);
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, loadData]);

  const stats = data.stats || {};
  const avgCpu = data.processes.length ? (data.processes.reduce((sum, item) => sum + (Number(item.cpu_percent) || 0), 0) / data.processes.length).toFixed(1) : null;
  const processMemory = data.processes.length ? data.processes.reduce((sum, item) => sum + (Number(item.memory_percent) || 0), 0).toFixed(1) : null;

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Shield size={22} /></div>
          <div><strong>MINI<span>-EDR</span></strong><small>Endpoint defense console</small></div>
        </div>
        <div className="topbar-meta">
          <label className="auto-refresh-toggle">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto-refresh
          </label>
          <span className="live-indicator"><Circle size={9} fill="currentColor" /> {autoRefresh ? "TELEMETRY ONLINE" : "TELEMETRY PAUSED"}</span>
          <span className="updated">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Awaiting telemetry"}</span>
          <button className="icon-button" onClick={() => loadData(false)} aria-label="Refresh telemetry" title="Refresh telemetry">
            <RefreshCw size={17} className={loading ? "spin" : ""} />
          </button>
        </div>
      </header>
      <main className="shell">
        <div className="intro">
          <div>
            <div className="breadcrumb"><span>SECURITY OPERATIONS</span><ChevronRight size={13} /><span>SINGLE ENDPOINT</span></div>
            <h1>Endpoint command view</h1>
            <p>Live telemetry, detection signals, and network activity from this Windows host.</p>
          </div>
          <div className="host-chip"><TerminalSquare size={16} /><span>LOCAL HOST</span><b>127.0.0.1</b></div>
        </div>
        
        {error && (
          <div className="connection-banner">
            <AlertTriangle size={18} /><span>{error}</span><button onClick={() => loadData(false)}>Retry</button>
          </div>
        )}
        
        <div className="overview-heading">
          <div>
            <span className="section-kicker">SYSTEM OVERVIEW</span><h2>Host activity at a glance</h2>
          </div>
          <span className="telemetry-badge"><Zap size={13} /> LIVE COLLECTION</span>
        </div>
        
        <section className="metrics-grid">
          <MetricCard label="Avg process CPU" value={avgCpu === null ? null : `${avgCpu}%`} detail="Across running processes" tone="cyan" icon={Cpu} />
          <MetricCard label="Process memory" value={processMemory === null ? null : `${processMemory}%`} detail="Combined process footprint" tone="amber" icon={MemoryStick} />
          <MetricCard label="Processes analyzed" value={stats.total} detail={`${stats.high || 0} high-risk detections`} tone="red" icon={ShieldAlert} />
          <MetricCard label="Connections" value={data.network.length} detail="Active inet connections" tone="green" icon={Network} />
        </section>
        
        <div className="feature-grid">
          <section className="panel activity-panel">
            <div className="section-header">
              <div className="section-title">
                <div className="section-icon"><Cpu size={17} /></div>
                <div><span>PROCESS SIGNAL</span><h2>Activity profile</h2></div>
              </div>
            </div>
            <ActivityChart processes={data.processes} />
          </section>
          
          <section className="panel risk-panel">
            <div className="section-header">
              <div className="section-title">
                <div className="section-icon"><ShieldAlert size={17} /></div>
                <div><span>SECURITY STATUS</span><h2>Risk distribution</h2></div>
              </div>
            </div>
            <RiskBars stats={stats} />
            <div className="risk-total"><span><span className="legend-dot cyan" />Total analyzed</span><strong>{stats.total ?? "-"}</strong></div>
          </section>
        </div>
        
        <AlertsPanel alerts={data.alerts} loading={loading} error={error} />
        <ProcessTable processes={data.processes} loading={loading} error={error} query={query} setQuery={setQuery} onActionComplete={() => loadData(true)} />
        <NetworkPanel network={data.network} loading={loading} error={error} />
      </main>
      <footer>
        <span><Shield size={14} /> MINI-EDR CONSOLE</span><span>FastAPI telemetry bridge <b>v1.0</b></span>
      </footer>
    </>
  );
}

