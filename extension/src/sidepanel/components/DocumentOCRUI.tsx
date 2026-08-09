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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
          <FileScan className="w-4 h-4 text-indigo-400" />
          Local OCR Anomaly Detector (eng + ben)
        </h3>
      </div>

      <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-800/30 rounded-xl p-4 text-center cursor-pointer block transition-all">
        <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
        <span className="text-xs font-semibold text-slate-200 block">
          Upload Aadhaar / Land Document (PNG/JPG)
        </span>
        <span className="text-[11px] text-slate-400 block mt-0.5">
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
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 text-center space-y-2">
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-300 font-medium">Running Tesseract.js (eng + ben) locally...</p>
        </div>
      )}

      {ocrResult && !isAnalyzing && (
        <div className="space-y-3 pt-2">
          <div className={`p-3 rounded-lg border text-xs space-y-2 ${
            ocrResult.isClean
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {ocrResult.isClean ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-sm">
                    {ocrResult.isClean ? 'OCR Clean & Verified' : 'Flagged for Manual Verification'}
                  </p>
                  <p className="text-[11px] opacity-90">
                    Confidence: {ocrResult.confidence}% (Threshold: 75%)
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                ocrResult.isClean
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  : 'bg-amber-950 border-amber-600 text-amber-300'
              }`}>
                {ocrResult.isClean ? 'CLEAN (75%+)' : 'ATTENTION REQUIRED'}
              </span>
            </div>

            {ocrResult.anomaliesFound.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-800/60">
                <p className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  Flagged Anomalies:
                </p>
                {ocrResult.anomaliesFound.map((warn, i) => (
                  <p key={i} className="text-[11px] bg-slate-900/60 p-1.5 rounded border border-slate-700/60 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
            <span className="font-semibold text-slate-400 block">Extracted Text Sample:</span>
            <p className="font-mono text-slate-300 text-[10px] break-words line-clamp-3">
              {ocrResult.extractedText || 'No clear text recognized.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
