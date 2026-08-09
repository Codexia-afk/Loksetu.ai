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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-4 shadow-sm text-xs">
      {/* Tracker Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-600" />
          Post-Submission Application Tracker
        </h3>
        <span className="text-[10px] font-extrabold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md shadow-2xs">
          100% On-Device
        </span>
      </div>

      {/* Add New Reference Form */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
        <h4 className="font-bold text-slate-900 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5 text-emerald-600" />
          Record Application Reference Number
        </h4>

        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Acknowledgment / Reference ID (from portal receipt)
            </label>
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="e.g. KB-2026-WB-88912"
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-xs shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700">Remind to check status in:</label>
              <select
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 font-semibold text-xs mt-1 shadow-2xs"
              >
                <option value={3}>3 Days</option>
                <option value={7}>7 Days (Recommended)</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>

            <button
              onClick={handleAddTracker}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Save Encrypted Tracker
            </button>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl flex items-center justify-between text-[11px] font-semibold">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Active Trackers List */}
      <div className="space-y-2">
        <h4 className="font-bold text-slate-800 flex items-center gap-1">
          <Bell className="w-3.5 h-3.5 text-amber-500" />
          Active Application Tracking Reminders ({records.length})
        </h4>

        {records.length === 0 ? (
          <p className="text-[11px] text-slate-500 font-medium italic bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
            No active reference numbers saved yet. After submitting your form manually on the portal, paste your reference number above to set encrypted local reminders.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {records.map(rec => (
              <div key={rec.trackerId} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">{rec.schemeName}</span>
                  <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 font-bold">
                    {referenceMask(rec.referenceNumber)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-1 font-medium">
                  <span>Saved: {new Date(rec.submissionDate).toLocaleDateString()}</span>
                  <a
                    href={rec.officialStatusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 underline font-bold flex items-center gap-0.5 hover:text-emerald-900"
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
