import React, { useState } from 'react';
import { Header } from './components/Header';
import { SchemeForm } from './components/SchemeForm';
import { SubmissionModal } from './components/SubmissionModal';

export const App: React.FC = () => {
  const [submittedData, setSubmittedData] = useState<Record<string, string> | null>(null);

  return (
    <div className="app-container">
      <Header />
      <main className="main-container">
        <div className="form-card">
          <div className="form-card-header">
            <h2>Application for Krishak Bandhu Financial Assistance (2026-27)</h2>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>State Portal Simulator</span>
          </div>
          <div className="form-card-body">
            <SchemeForm onSubmit={(data) => setSubmittedData(data)} />
          </div>
        </div>
      </main>
      <SubmissionModal formData={submittedData} onClose={() => setSubmittedData(null)} />
    </div>
  );
};

export default App;
