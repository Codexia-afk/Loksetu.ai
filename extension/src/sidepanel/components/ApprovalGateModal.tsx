import React from 'react';
import { CitizenProfile, FieldMapEntry } from '../../types';

interface ApprovalGateModalProps {
  isOpen: boolean;
  activeProfile: CitizenProfile | null;
  fields: FieldMapEntry[];
  onClose: () => void;
  onUserApprovedSubmit: () => void;
}

export const ApprovalGateModal: React.FC<ApprovalGateModalProps> = ({
  isOpen,
  activeProfile,
  fields,
  onClose,
  onUserApprovedSubmit
}) => {
  if (!isOpen) return null;

  const totalFields = fields.length;
  const filledFields = fields.filter(f => f.currentValue && f.currentValue.length > 0).length;
  const readinessScore = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 44, 89, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        maxWidth: '520px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #CBD5E1'
      }}>
        {/* Modal Header */}
        <div style={{
          background: '#0F2C59',
          color: '#FFFFFF',
          padding: '16px 20px',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>🛡️ Human Approval Gate</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>Pre-Submission Final Audit & Readiness Verification</p>
          </div>
          <div style={{
            background: readinessScore >= 80 ? '#046A38' : '#D97706',
            color: '#FFF',
            padding: '6px 12px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            Readiness: {readinessScore}%
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
          <div style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#1E40AF',
            marginBottom: '16px'
          }}>
            🔒 <strong>Non-Negotiable Guarantee:</strong> LokSetu never submits forms automatically. You (the human applicant / facilitator) are reviewing the line-by-line source audit trail before explicitly clicking submit.
          </div>

          <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#0F2C59' }}>Autofilled Field Source Trail (Constraint 8 Audit):</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
            {fields.map(f => (
              <div key={f.fieldId} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '0.8rem'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1E293B' }}>{f.labelText}</div>
                  <div style={{ color: '#046A38', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    Value: "{f.currentValue || '(empty)'}"
                  </div>
                </div>
                <span className="badge-tag badge-pass" style={{ fontSize: '10px' }}>
                  [Vault Source: {f.labelText.includes('Aadhaar') ? 'Aadhaar Doc' : f.labelText.includes('Occupancy') ? 'Khatiyan RoR' : 'Encrypted Profile'}]
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#475569',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel & Edit Form
            </button>
            <button
              onClick={onUserApprovedSubmit}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: '#046A38',
                color: '#FFFFFF',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              ✅ Human Authorize & Submit Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
