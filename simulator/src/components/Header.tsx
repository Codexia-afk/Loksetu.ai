import React from 'react';

export const Header: React.FC = () => {
  return (
    <header>
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="emblem-stub">GOI</div>
          <span>Government of West Bengal — Department of Agriculture</span>
        </div>
        <div>
          <span>Portal Language: English | বাংলা</span>
        </div>
      </div>
      <div className="portal-header">
        <div className="portal-header-content">
          <div className="portal-title">
            <h1>Krishak Bandhu (Assured Income) Direct Application Portal</h1>
            <p>Official Online Direct Benefit Transfer Application Form for Farmers</p>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', background: '#E0F2FE', color: '#0369A1', padding: '6px 12px', borderRadius: '20px', fontWeight: 600 }}>
              Form ID: KB-2026-WB-SIM
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
