"use client";

import { useEffect, useState } from "react";
import { ListSkeleton } from "@/components/ui/Skeleton";

interface AuditLogEntry {
  _id: string;
  admin: { name: string; email: string } | null;
  action: string;
  targetType?: string;
  targetId?: string;
  changes?: Record<string, unknown>;
  createdAt: string;
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit-logs?limit=50")
      .then((res) => res.json())
      .then((data) => setLogs(data.logs ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Activity Log</h1>

      {loading ? (
        <ListSkeleton rows={8} />
      ) : logs.length === 0 ? (
        <p className="text-gray-400">No activity recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log._id} className="border rounded-md p-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{log.action}</span>
                <span className="text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-500">
                {log.admin?.email ?? "Unknown admin"}
                {log.targetType && ` — ${log.targetType}`}
              </p>
              {log.changes && (
                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(log.changes, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
