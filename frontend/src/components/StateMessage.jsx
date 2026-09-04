import { LoaderCircle, AlertTriangle, Database } from "lucide-react";

export function StateMessage({ loading, error, empty, children }) {
  if (loading) return <div className="table-state"><LoaderCircle className="spin" size={20} /> Loading endpoint data...</div>;
  if (error) return <div className="table-state error-state"><AlertTriangle size={20} /> {error}</div>;
  if (empty) return <div className="table-state"><Database size={20} /> {children || "No records found."}</div>;
  return null;
}

