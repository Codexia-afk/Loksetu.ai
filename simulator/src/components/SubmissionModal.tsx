import React from 'react';

interface SubmissionModalProps {
  formData: Record<string, string> | null;
  onClose: () => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ formData, onClose }) => {
  if (!formData) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#046A38', marginBottom: '12px' }}>
          <span style={{ fontSize: '2rem' }}>✅</span>
          <h3 style={{ margin: 0 }}>Application Submitted (Simulator State)</h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '16px' }}>
          Your application has been received by the simulated Krishak Bandhu Portal.
        </p>
        <div style={{
          background: '#F3F4F6',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '0.85rem',
          maxHeight: '200px',
          overflowY: 'auto',
          marginBottom: '16px'
        }}>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: '#0F2C59',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Close Simulator Modal
        </button>
      </div>
    </div>
  );
};
