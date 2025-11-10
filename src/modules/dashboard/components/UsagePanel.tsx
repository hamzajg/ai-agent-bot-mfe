import React, { useMemo, useState } from 'react';
import { clearUsage, getLogs, getSettings, getUsageSummary, setSettings } from '@shared/utils/usage';

const SmallStat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="p-3 bg-white border rounded-lg">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
);

const UsagePanel: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const summary = useMemo(() => getUsageSummary(7), [refreshKey]);
  const logs = useMemo(() => getLogs(100), [refreshKey]);
  const settings = useMemo(() => getSettings(), [refreshKey]);

  const onExport = () => {
    const payload = {
      summary: getUsageSummary(30),
      logs: getLogs(1000),
      settings: getSettings(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ai-agent-usage.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const onClear = () => {
    clearUsage();
    setRefreshKey((k) => k + 1);
  };

  const setContentLogging = (on: boolean) => {
    setSettings({ logMessageContent: on });
    setRefreshKey((k) => k + 1);
  };

  const setLogCap = (cap: number) => {
    setSettings({ logCap: cap });
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Usage</h2>
        <div className="flex gap-2">
          <button onClick={onExport} className="border px-3 py-2 rounded">Export</button>
          <button onClick={onClear} className="border px-3 py-2 rounded">Clear</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SmallStat label="Messages (7d)" value={summary.totals.messages} />
        <SmallStat label="Actions (7d)" value={summary.totals.actions} />
        <SmallStat label="Clicks (7d)" value={summary.totals.clicks} />
        <SmallStat label="Errors (7d)" value={summary.totals.errors} />
      </div>

      <div className="mt-4 bg-white border rounded-lg p-4">
        <div className="text-sm font-medium mb-2">By Action (all time)</div>
        <div className="grid md:grid-cols-3 gap-2">
          {Object.entries(summary.byAction).length === 0 && (
            <div className="text-sm text-gray-500">No action data yet.</div>
          )}
          {Object.entries(summary.byAction).map(([name, count]) => (
            <div key={name} className="border rounded px-3 py-2 text-sm flex justify-between">
              <span>{name}</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-white border rounded-lg p-4 overflow-x-auto">
        <div className="text-sm font-medium mb-2">Recent Events</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-1 pr-4">Time</th>
              <th className="py-1 pr-4">Type</th>
              <th className="py-1 pr-4">Meta</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td className="py-2 text-gray-500" colSpan={3}>No events yet.</td></tr>
            )}
            {logs.map((ev) => (
              <tr key={ev.id} className="border-t">
                <td className="py-1 pr-4 text-gray-600">{new Date(ev.t).toLocaleString()}</td>
                <td className="py-1 pr-4">{ev.type}</td>
                <td className="py-1 pr-4 text-gray-700 whitespace-pre-wrap break-words">{JSON.stringify(ev.meta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 bg-white border rounded-lg p-4">
        <div className="text-sm font-medium mb-2">Logging Settings</div>
        <div className="flex items-center gap-3 mb-2">
          <label className="text-sm">Log message content</label>
          <input type="checkbox" checked={settings.logMessageContent} onChange={(e) => setContentLogging(e.target.checked)} />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm">Log cap</label>
          <input type="number" className="border rounded px-2 py-1 w-28" value={settings.logCap} onChange={(e) => setLogCap(parseInt(e.target.value || '1000', 10))} />
        </div>
      </div>
    </div>
  );
};

export default UsagePanel;