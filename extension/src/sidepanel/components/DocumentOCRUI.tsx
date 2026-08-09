import React, { useState } from 'react';
import { CitizenProfile, OCRAnomalyResult } from '../../types';
import { analyzeDocument } from '../../engine/ocrAnomalyDetector';
import { FileScan, Upload, AlertTriangle, CheckCircle2, Loader2, Info } from 'lucide-react';

interface DocumentOCRUIProps {
  profile: CitizenProfile;
}

export const DocumentOCRUI: React.FC<DocumentOCRUIProps> = ({ profile }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRAnomalyResult | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzeDocument(file, profile.fullName || '');
      setOcrResult(res);
    } catch (err: any) {
      setOcrResult({
        documentType: 'Uploaded Document',
        extractedText: '',
        confidence: 0,
        anomaliesFound: [`OCR Processing Error: ${err.message}`],
        isClean: false
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <FileScan className="w-4 h-4 text-emerald-600" />
          Local OCR Anomaly Detector (eng + ben)
        </h3>
      </div>

      <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/80 hover:bg-emerald-50/20 rounded-2xl p-5 text-center cursor-pointer block transition-all shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-2 text-emerald-600">
          <Upload className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-900 block">
          Upload Aadhaar / Land Document (PNG/JPG)
        </span>
        <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
          Runs 100% on-device inside Web Worker • Zero server upload
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isAnalyzing}
          className="hidden"
        />
      </label>

      {isAnalyzing && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-800 font-semibold">Running Tesseract.js (eng + ben) locally...</p>
        </div>
      )}

      {ocrResult && !isAnalyzing && (
        <div className="space-y-3 pt-1">
          <div className={`p-3.5 rounded-xl border text-xs space-y-2.5 shadow-2xs ${
            ocrResult.isClean
              ? 'bg-emerald-50/90 border-emerald-200/90 text-emerald-900'
              : 'bg-amber-50/90 border-amber-200/90 text-amber-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {ocrResult.isClean ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <p className="font-extrabold text-sm leading-tight">
                    {ocrResult.isClean ? 'OCR Clean & Verified' : 'Flagged for Manual Verification'}
                  </p>
                  <p className="text-[11px] font-medium opacity-90">
                    Confidence: {ocrResult.confidence}% (Threshold: 75%)
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg border shadow-2xs ${
                ocrResult.isClean
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-amber-600 text-white border-amber-600'
              }`}>
                {ocrResult.isClean ? 'CLEAN (75%+)' : 'ATTENTION REQUIRED'}
              </span>
            </div>

            {ocrResult.anomaliesFound.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                <p className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  Flagged Anomalies:
                </p>
                {ocrResult.anomaliesFound.map((warn, i) => (
                  <p key={i} className="text-[11px] bg-white p-2 rounded-lg border border-amber-200 flex items-start gap-1.5 text-slate-800 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
            <span className="font-bold text-slate-700 block">Extracted Text Sample:</span>
            <p className="font-mono text-slate-800 text-[10px] break-words line-clamp-3 leading-relaxed">
              {ocrResult.extractedText || 'No clear text recognized.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
