import React, { useState } from 'react';
import { FieldMapEntry } from '../../types';

interface ApplicationMapProps {
  fields: FieldMapEntry[];
  onScanTrigger: () => void;
}

export const ApplicationMap: React.FC<ApplicationMapProps> = ({ fields, onScanTrigger }) => {
  const totalCount = fields.length;

  const sectionCounts = {
    personal: fields.filter(f => f.section === 'personal').length,
    address: fields.filter(f => f.section === 'address').length,
    land_income: fields.filter(f => f.section === 'land_income').length,
    documents: fields.filter(f => f.section === 'documents').length,
  };

  const filledCount = fields.filter(f => f.currentValue && f.currentValue.length > 0).length;
  const completionPercentage = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  return (
    <div className="sp-card">
      <div className="sp-card-title">
        <span>🗺️ Application Map (DOM Parser)</span>
        <button
          onClick={onScanTrigger}
          style={{ padding: '2px 8px', fontSize: '10px', background: '#0F2C59', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          🔄 Rescan Form
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
          <span>Total Detected Fields: <strong>{totalCount}</strong></span>
          <span>Form Completion: <strong>{completionPercentage}%</strong></span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${completionPercentage}%` }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '6px 8px', borderRadius: '4px' }}>
          <span>1. Personal Info</span>
          <span className="badge-tag badge-info">{sectionCounts.personal} fields</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '6px 8px', borderRadius: '4px' }}>
          <span>2. Address Details</span>
          <span className="badge-tag badge-info">{sectionCounts.address} fields</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '6px 8px', borderRadius: '4px' }}>
          <span>3. Income & Land</span>
          <span className="badge-tag badge-info">{sectionCounts.land_income} fields</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '6px 8px', borderRadius: '4px' }}>
          <span>4. Documents Enclosed</span>
          <span className="badge-tag badge-info">{sectionCounts.documents} slots</span>
        </div>
      </div>

      {fields.some(f => f.isVague) && (
        <div style={{ marginTop: '8px', background: '#FEF3C7', border: '1px solid #FCD34D', padding: '6px 8px', borderRadius: '4px', fontSize: '10px', color: '#92400E' }}>
          ⚠️ <strong>Disambiguation Flag:</strong> {fields.filter(f => f.isVague).length} ambiguous label(s) detected (`Nature of Occupancy`, `Land Holding Scale`). Smart guidance available.
        </div>
      )}
    </div>
  );
};
