import { Network, Globe2 } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { StateMessage } from "./StateMessage";

export function NetworkPanel({ network, loading, error }) {
  return (
    <section className="panel">
      <SectionHeader icon={Network} eyebrow="NETWORK VISIBILITY" title="Network activity" count={network.length} />
      <StateMessage loading={loading} error={error && !network.length ? error : ""} empty={!network.length && !loading}>No active network connections detected.</StateMessage>
      {network.length > 0 && (
        <div className="table-wrap scroll-table">
          <table>
            <thead>
              <tr>
                <th>Process</th>
                <th>PID</th>
                <th>Status</th>
                <th>Local address</th>
                <th>Remote endpoint</th>
              </tr>
            </thead>
            <tbody>
              {network.map((connection, index) => (
                <tr key={`${connection.pid}-${connection.local_address}-${index}`}>
                  <td>
                    <div className="process-name">
                      <Globe2 size={15} className="network-icon" />{connection.process_name || "Unknown"}
                    </div>
                  </td>
                  <td className="mono">{connection.pid}</td>
                  <td><span className="status"><span />{connection.status || "-"}</span></td>
                  <td className="mono">{connection.local_address || "-"}</td>
                  <td className="mono">{connection.remote_ip ? `${connection.remote_ip}:${connection.remote_port ?? "-"}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

