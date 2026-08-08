import React, { useState } from 'react';
import { OCRResult } from '../../types';
import { processDocumentOCR } from '../../services/ocrEngine';

export const OCRScanner: React.FC = () => {
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [docType, setDocType] = useState<'aadhaar' | 'land_record' | 'bank_passbook'>('land_record');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await processDocumentOCR(file, docType);
      setOcrResult(result);
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateLowConfidence = () => {
    setOcrResult({
      extractedText: 'Handwritten RoR text: Khatiyan No. 402/1, Dag No. 1542...',
      confidence: 58.4,
      documentType: 'land_record',
      certificateNumber: '402/1',
      isFlaggedForManualReview: true // < 75% threshold
    });
  };

  const handleSimulateHighConfidence = () => {
    setOcrResult({
      extractedText: 'Government of India Aadhaar - 9876 5432 1098 DOB: 15/06/1985 Name: Ramesh Chandra Das',
      confidence: 94.2,
      documentType: 'aadhaar',
      issueDate: '15/06/1985',
      nameFound: 'Ramesh Chandra Das',
      isFlaggedForManualReview: false
    });
  };

  return (
    <div className="sp-card">
      <div className="sp-card-title">
        <span>📄 Document Intelligence (OCR Anomaly Hub)</span>
      </div>

      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>
        Bundled Tesseract.js Worker Languages: <strong>eng + ben</strong>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        <select
          className="form-control"
          style={{ padding: '4px 6px', fontSize: '11px', flex: 1 }}
          value={docType}
          onChange={(e: any) => setDocType(e.target.value)}
        >
          <option value="aadhaar">Aadhaar Card</option>
          <option value="land_record">Land Record (Khatiyan)</option>
          <option value="bank_passbook">Bank Passbook</option>
        </select>

        <label style={{ padding: '6px 10px', background: '#0F2C59', color: '#FFF', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
          Upload Document
          <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        <button onClick={handleSimulateHighConfidence} style={{ flex: 1, padding: '4px', fontSize: '10px', background: '#DEF7EC', color: '#03543F', border: '1px solid #84E1BC', borderRadius: '4px', cursor: 'pointer' }}>
          🧪 Test Clean Aadhaar (94% Conf)
        </button>
        <button onClick={handleSimulateLowConfidence} style={{ flex: 1, padding: '4px', fontSize: '10px', background: '#FDE8E8', color: '#9B1C1C', border: '1px solid #F8B4B4', borderRadius: '4px', cursor: 'pointer' }}>
          🧪 Test Low Quality (58% Conf)
        </button>
      </div>

      {isProcessing ? (
        <div style={{ fontSize: '11px', color: '#2563EB', fontStyle: 'italic' }}>
          ⚙️ OCR Worker processing document image...
        </div>
      ) : ocrResult ? (
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px', borderRadius: '6px', fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Confidence Score: <strong>{ocrResult.confidence.toFixed(1)}%</strong></span>
            <span className={`badge-tag ${ocrResult.isFlaggedForManualReview ? 'badge-fail' : 'badge-pass'}`}>
              {ocrResult.isFlaggedForManualReview ? '⚠️ MANUALLY VERIFY' : '✓ AUTO-VERIFIED'}
            </span>
          </div>

          {ocrResult.isFlaggedForManualReview ? (
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '6px', borderRadius: '4px', fontSize: '10px', marginTop: '4px', border: '1px solid #FCA5A5' }}>
              <strong>Constraint 6 Anomaly Flag:</strong> OCR confidence is below 75%. Field will not be auto-populated without human manual confirmation.
            </div>
          ) : (
            <div style={{ fontSize: '10px', color: '#166534', marginTop: '4px' }}>
              Extracted: {ocrResult.nameFound || ocrResult.certificateNumber || 'Extracted document serial metadata'}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
