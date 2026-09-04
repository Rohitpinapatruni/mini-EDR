export function MetricCard({ label, value, detail, tone, icon: Icon }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-top">
        <span>{label}</span><Icon size={16} />
      </div>
      <strong>{value ?? "-"}</strong>
      <small>{detail}</small>
      <div className="metric-line" />
    </article>
  );
}

