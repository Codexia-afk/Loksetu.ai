import React, { useState, useEffect } from 'react';
import { FormField, ApplicationMapData, ScopedExplainerPayload } from '../../types';
import { explainFieldLabel } from '../../engine/geminiExplainer';
import { Volume2, VolumeX, Sparkles, CheckCircle2, HelpCircle, FileText, AlertCircle } from 'lucide-react';

interface ApplicationMapUIProps {
  mapData: ApplicationMapData | null;
  onScanClick: () => void;
  onAutofillClick: () => void;
}

export const ApplicationMapUI: React.FC<ApplicationMapUIProps> = ({
  mapData,
  onScanClick,
  onAutofillClick
}) => {
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [bengaliVoice, setBengaliVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speakingFieldId, setSpeakingFieldId] = useState<string | null>(null);

  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const bnVoice = voices.find(v => v.lang.startsWith('bn') || v.name.toLowerCase().includes('bengali'));
        setBengaliVoice(bnVoice || null);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleExplainField = async (field: FormField) => {
    const payload: ScopedExplainerPayload = {
      fieldId: field.id,
      labelText: field.label,
      ariaLabel: field.ariaLabel || '',
      inputType: field.type,
      placeholder: field.placeholder || '',
      contextHint: field.contextHint || 'General Form'
    };

    const explanation = await explainFieldLabel(payload);
    setExplanations(prev => ({ ...prev, [field.id]: explanation }));
  };

  const handleSpeakText = (fieldId: string, text: string) => {
    if (!bengaliVoice || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingFieldId === fieldId) {
      window.speechSynthesis.cancel();
      setSpeakingFieldId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = bengaliVoice;
    utterance.lang = 'bn-IN';
    utterance.onend = () => setSpeakingFieldId(null);
    utterance.onerror = () => setSpeakingFieldId(null);

    setSpeakingFieldId(fieldId);
    window.speechSynthesis.speak(utterance);
  };

  if (!mapData) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 text-center space-y-3 shadow-2xs">
        <FileText className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">No Portal Form Analyzed Yet</h3>
        <p className="text-xs text-slate-500">
          Open a supported government portal form in localhost and click scan below.
        </p>
        <button
          onClick={onScanClick}
          className="bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
        >
          Scan Active Portal Page
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-2xs">
      {/* Header & Portal Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#0F2C59]" />
            {mapData.portalName}
          </h3>
          <p className="text-xs text-slate-500">Detected {mapData.totalFields} form input fields</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-extrabold text-[#046A38]">{mapData.readinessScore}%</div>
          <p className="text-[10px] text-slate-500 font-semibold">Readiness Score</p>
        </div>
      </div>

      {/* Readiness Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-600">
          <span className="font-medium">Form Completion Progress</span>
          <span className="font-bold text-slate-900">{mapData.completionPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
          <div
            className="bg-gradient-to-r from-[#0F2C59] to-[#046A38] h-full transition-all duration-500 rounded-full"
            style={{ width: `${mapData.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Field List & Explainer */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {mapData.fields.map(field => {
          const explanation = explanations[field.id];
          const isFilled = field.value.trim().length > 0;

          return (
            <div
              key={field.id}
              className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isFilled ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <span className="font-bold text-slate-800">{field.label}</span>
                </div>

                <div className="flex items-center space-x-1">
                  {field.isVague && !explanation && (
                    <button
                      onClick={() => handleExplainField(field)}
                      className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-indigo-100 transition-all shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Explain Jargon
                    </button>
                  )}
                </div>
              </div>

              {/* Jargon Explanation Card */}
              {explanation && (
                <div className="mt-1 bg-indigo-50/90 border border-indigo-200 rounded-lg p-2 text-indigo-950 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-indigo-600" /> Plain Language Hint
                    </span>

                    <button
                      onClick={() => handleSpeakText(field.id, explanation)}
                      disabled={!bengaliVoice}
                      title={bengaliVoice ? 'Read aloud in Bengali voice' : 'Bengali TTS voice unavailable'}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 transition-all ${
                        bengaliVoice
                          ? speakingFieldId === field.id
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      {speakingFieldId === field.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-white" /> Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-amber-600" /> Listen (BN)
                        </>
                      )}
                    </button>
                  </div>
                  <p className="leading-snug">{explanation}</p>
                  {field.contextHint && (
                    <p className="text-[10px] text-indigo-700/80 font-mono font-medium">
                      Context: {field.contextHint}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={onScanClick}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl text-xs font-bold border border-slate-200 transition-all"
        >
          Re-scan DOM
        </button>
        <button
          onClick={onAutofillClick}
          className="flex-1 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Review & Autofill
        </button>
      </div>
    </div>
  );
};
