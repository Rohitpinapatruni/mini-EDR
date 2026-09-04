import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ActivityChart({ processes }) {
  // Take top 24 processes and map them for the chart
  const data = processes.slice(0, 24).map((p, index) => ({
    name: p.name || "Unknown",
    cpu: Math.min(Number(p.cpu_percent) || 0, 100),
    memory: Math.min(Number(p.memory_percent) || 0, 100),
    index: index,
  }));

  if (data.length === 0) {
    return (
      <div className="activity-chart empty">
        <p>Awaiting telemetry...</p>
      </div>
    );
  }

  return (
    <div className="activity-chart" style={{ width: "100%", height: "250px", marginTop: "20px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#52d7e8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#52d7e8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f6c568" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f6c568" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#8296aa" fontSize={11} tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + "..." : val} />
          <YAxis stroke="#8296aa" fontSize={11} />
          <CartesianGrid strokeDasharray="3 3" stroke="#1c3044" vertical={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#0d1a2a", border: "1px solid #1c3044", borderRadius: "8px", fontSize: "12px", color: "#e0edf5" }}
            itemStyle={{ color: "#fff" }}
          />
          <Area type="monotone" dataKey="memory" stroke="#f6c568" fillOpacity={1} fill="url(#colorMemory)" name="Memory %" />
          <Area type="monotone" dataKey="cpu" stroke="#52d7e8" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

