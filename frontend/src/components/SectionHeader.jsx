export function SectionHeader({ icon: Icon, eyebrow, title, count }) {
  return (
    <div className="section-header">
      <div className="section-title">
        <div className="section-icon"><Icon size={17} /></div>
        <div><span>{eyebrow}</span><h2>{title}</h2></div>
      </div>
      {count !== undefined && <span className="record-count">{count} records</span>}
    </div>
  );
}

