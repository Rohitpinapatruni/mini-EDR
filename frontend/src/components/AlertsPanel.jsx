import { ShieldAlert } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { StateMessage } from "./StateMessage";

export function AlertsPanel({ alerts, loading, error }) {
  return (
    <section className="panel">
      <SectionHeader icon={ShieldAlert} eyebrow="DETECTION ENGINE" title="Recent security events" count={alerts.length} />
      <StateMessage loading={loading} error={error && !alerts.length ? error : ""} empty={!alerts.length && !loading}>No security alerts detected.</StateMessage>
      {alerts.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Severity</th>
                <th>Process</th>
                <th>Score</th>
                <th>Event</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, index) => (
                <tr key={`${alert.id || alert.pid}-${index}`}>
                  <td className="timestamp">{alert.created_at ? new Date(alert.created_at).toLocaleString() : "-"}</td>
                  <td><span className={`severity ${String(alert.severity || "").toLowerCase()}`}>{alert.severity || "-"}</span></td>
                  <td>
                    <strong>{alert.process_name || "Unknown"}</strong>
                    <small className="table-sub">PID {alert.pid ?? "-"}</small>
                  </td>
                  <td className="score">{alert.score ?? "-"}</td>
                  <td className="description">{alert.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

