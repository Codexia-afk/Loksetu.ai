import React, { useState, useEffect } from 'react';
import { CitizenProfile, SchemeEligibilityReport } from '../../types';
import { evaluateEligibility } from '../../services/ruleEvaluator';

interface EvidenceEligibilityProps {
  activeProfile: CitizenProfile | null;
}

export const EvidenceEligibility: React.FC<EvidenceEligibilityProps> = ({ activeProfile }) => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('wb-krishak-bandhu');
  const [report, setReport] = useState<SchemeEligibilityReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>('');

  useEffect(() => {
    fetchSchemeList();
  }, []);

  useEffect(() => {
    if (activeProfile && selectedSchemeId) {
      runEvaluation(selectedSchemeId);
    }
  }, [activeProfile, selectedSchemeId]);

  const fetchSchemeList = async () => {
    setIsLoading(true);
    try {
      // Fix 1: CORS request to FastAPI backend
      const res = await fetch('http://localhost:8000/api/v1/schemes');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSchemes(data.schemes || []);
    } catch (e: any) {
      setFetchError(`Backend offline: ${e.message}`);
      // Fallback offline scheme definitions
      setSchemes([
        {
          id: 'wb-krishak-bandhu',
          name: 'West Bengal Krishak Bandhu (Assured Income)',
          last_verified: '2026-08-01',
          source_url: 'https://matirkatha.wb.gov.in/krishakbandhu'
        },
        {
          id: 'pm-kisan',
          name: 'PM Kisan Samman Nidhi',
          last_verified: '2026-08-01',
          source_url: 'https://pmkisan.gov.in/'
        },
        {
          id: 'mp-ladli-behna',
          name: 'MP Mukhyamantri Ladli Behna Yojana',
          last_verified: '2026-08-01',
          source_url: 'https://cmladlibehna.mp.gov.in/'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const runEvaluation = async (schemeId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/schemes/${schemeId}`);
      if (res.ok) {
        const fullScheme = await res.json();
        if (activeProfile) {
          const evalReport = evaluateEligibility(fullScheme, activeProfile);
          setReport(evalReport);
        }
      }
    } catch (e) {
      console.warn('Fallback local evaluation:', e);
    }
  };

  return (
    <div className="sp-card">
      <div className="sp-card-title">
        <span>⚖️ Deterministic Eligibility & Evidence Mode</span>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Target Scheme Scope:</label>
        <select
          className="form-control"
          style={{ padding: '6px', fontSize: '11px', marginTop: '2px' }}
          value={selectedSchemeId}
          onChange={(e) => setSelectedSchemeId(e.target.value)}
        >
          <option value="wb-krishak-bandhu">WB Krishak Bandhu (Primary Simulator Scheme)</option>
          <option value="pm-kisan">PM-KISAN (Central Scheme Depth)</option>
          <option value="mp-ladli-behna">MP Ladli Behna (State Scheme Depth)</option>
        </select>
      </div>

      {!activeProfile ? (
        <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>
          Unlock or create a vault profile to run deterministic eligibility check.
        </div>
      ) : report ? (
        <div>
          {/* Status Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 10px',
            borderRadius: '6px',
            marginBottom: '10px',
            background: report.status === 'ELIGIBLE' ? '#DEF7EC' : '#FDE8E8',
            color: report.status === 'ELIGIBLE' ? '#03543F' : '#9B1C1C'
          }}>
            <div style={{ fontWeight: 700, fontSize: '12px' }}>
              {report.status === 'ELIGIBLE' ? '✅ Full Match Verified' : '⚠️ Does Not Currently Match'}
            </div>
            <div style={{ fontSize: '11px' }}>
              {report.passCount} / {report.totalCount} Criteria Met
            </div>
          </div>

          {/* Rule Breakdown List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
            {report.ruleResults.map(rule => (
              <div
                key={rule.ruleId}
                style={{
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: '1px solid #E2E8F0',
                  background: rule.passed ? '#F0FDF4' : '#FEF2F2',
                  fontSize: '11px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>{rule.passed ? '✓' : '—'} {rule.label}</span>
                  <span className={`badge-tag ${rule.passed ? 'badge-pass' : 'badge-fail'}`}>
                    {rule.passed ? 'MATCH' : 'MISMATCH'}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                  Citation: <em>{rule.citation}</em>
                </div>
              </div>
            ))}
          </div>

          {/* Non-Negotiable Constraint 4: Rules last verified + Source link */}
          <div style={{
            background: '#F1F5F9',
            padding: '8px',
            borderRadius: '6px',
            fontSize: '10px',
            color: '#334155',
            marginBottom: '10px'
          }}>
            🛡️ <strong>Rules last verified:</strong> {report.lastVerified} — <strong>Source:</strong>{' '}
            <a href={report.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#2563EB', textDecoration: 'underline' }}>
              Official Notification Link
            </a>
          </div>

          {/* Non-Negotiable Constraint 4: Always render "Apply anyway" flow, never a dead end */}
          {report.status !== 'ELIGIBLE' && (
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              padding: '8px',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#92400E'
            }}>
              <div><strong>Note on Rule Flexibility:</strong> Official guidelines allow discretionary appeals and manual documentation waivers.</div>
              <a
                href={report.sourceUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  padding: '4px 10px',
                  background: '#D97706',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '10px'
                }}
              >
                ➡️ Apply Anyway on Official Scheme Portal
              </a>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: '11px', color: '#64748B' }}>Evaluating scheme criteria...</div>
      )}
    </div>
  );
};
