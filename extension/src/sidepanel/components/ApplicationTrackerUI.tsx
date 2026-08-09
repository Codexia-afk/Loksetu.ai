import React, { useState } from 'react';
import { createTrackerRecord, ApplicationTrackerRecord, getOfficialStatusUrl } from '../../engine/applicationTracker';
import { Clock, ExternalLink, Plus, CheckCircle2, ShieldCheck, Bell } from 'lucide-react';

interface ApplicationTrackerUIProps {
  schemeId?: string;
  schemeName?: string;
}

export const ApplicationTrackerUI: React.FC<ApplicationTrackerUIProps> = ({
  schemeId = 'wb_krishak_bandhu',
  schemeName = 'WB Krishak Bandhu'
}) => {
  const [refInput, setRefInput] = useState('');
  const [reminderDays, setReminderDays] = useState(7);
  const [records, setRecords] = useState<ApplicationTrackerRecord[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleAddTracker = () => {
    if (!refInput.trim()) {
      setStatusMsg('Please enter a valid application reference number.');
      return;
    }

    const record = createTrackerRecord(schemeId, schemeName, refInput, reminderDays);
    setRecords(prev => [record, ...prev]);
    setRefInput('');
    setStatusMsg(`Encrypted tracker created for '${referenceMask(record.referenceNumber)}'. Reminder set for ${reminderDays} days.`);
  };

  const referenceMask = (ref: string) => {
    if (ref.length <= 4) return ref;
    return `${ref.substring(0, 3)}****${ref.substring(ref.length - 2)}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
      {/* Tracker Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-indigo-400" />
          Post-Submission Application Tracker
        </h3>
        <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded">
          100% On-Device
        </span>
      </div>

      {/* Add New Reference Form */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 space-y-3">
        <h4 className="font-medium text-slate-200 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          Record Application Reference Number
        </h4>

        <div className="space-y-2">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Acknowledgment / Reference ID (from portal receipt)
            </label>
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="e.g. KB-2026-WB-88912"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-[11px] text-slate-400">Remind to check status in:</label>
              <select
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs mt-1"
              >
                <option value={3}>3 Days</option>
                <option value={7}>7 Days (Recommended)</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>

            <button
              onClick={handleAddTracker}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Save Encrypted Tracker
            </button>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-slate-950 border border-slate-800 text-indigo-300 p-2 rounded flex items-center justify-between text-[11px]">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="text-slate-500">✕</button>
        </div>
      )}

      {/* Active Trackers List */}
      <div className="space-y-2">
        <h4 className="font-semibold text-slate-300 flex items-center gap-1">
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          Active Application Tracking Reminders ({records.length})
        </h4>

        {records.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-3 rounded border border-slate-800 text-center">
            No active reference numbers saved yet. After submitting your form manually on the portal, paste your reference number above to set encrypted local reminders.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {records.map(rec => (
              <div key={rec.trackerId} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{rec.schemeName}</span>
                  <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">
                    {referenceMask(rec.referenceNumber)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 pt-1">
                  <span>Saved: {new Date(rec.submissionDate).toLocaleDateString()}</span>
                  <a
                    href={rec.officialStatusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 underline font-medium flex items-center gap-0.5 hover:text-indigo-300"
                  >
                    Check Status on Official Portal <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
