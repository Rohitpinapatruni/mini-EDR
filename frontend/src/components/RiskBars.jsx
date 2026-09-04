import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export function RiskBars({ stats }) {
  const data = [
    { name: "High", value: stats.high || 0, color: "#ff6d7e" },
    { name: "Medium", value: stats.medium || 0, color: "#f6c568" },
    { name: "Low", value: stats.low || 0, color: "#6be0a5" },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    data.push({ name: "Safe", value: 1, color: "#1c3044" });
  }

  return (
    <div className="risk-bars" style={{ width: "100%", height: "250px", marginTop: "10px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: "#0d1a2a", border: "1px solid #1c3044", borderRadius: "8px", fontSize: "12px", color: "#e0edf5" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value, name) => [value, name === "Safe" ? "Status" : "Risk Level"]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span style={{ color: "#8296aa", fontSize: "12px" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

