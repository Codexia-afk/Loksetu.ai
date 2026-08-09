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

  // Asynchronously load available voices for speech synthesis
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center space-y-3">
        <FileText className="w-8 h-8 text-slate-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-300">No Portal Form Analyzed Yet</h3>
        <p className="text-xs text-slate-400">
          Open a supported government portal form in localhost and click scan below.
        </p>
        <button
          onClick={onScanClick}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all shadow-md shadow-indigo-600/30"
        >
          Scan Active Portal Page
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      {/* Header & Portal Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            {mapData.portalName}
          </h3>
          <p className="text-xs text-slate-400">Detected {mapData.totalFields} form input fields</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-extrabold text-emerald-400">{mapData.readinessScore}%</div>
          <p className="text-[10px] text-slate-400 font-medium">Readiness Score</p>
        </div>
      </div>

      {/* Readiness Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Form Completion Progress</span>
          <span className="font-medium text-slate-200">{mapData.completionPercentage}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
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
              className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-2.5 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isFilled ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="font-medium text-slate-200">{field.label}</span>
                </div>

                <div className="flex items-center space-x-1">
                  {field.isVague && !explanation && (
                    <button
                      onClick={() => handleExplainField(field)}
                      className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-indigo-900 transition-all"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Explain Jargon
                    </button>
                  )}
                </div>
              </div>

              {/* Jargon Explanation Card */}
              {explanation && (
                <div className="mt-1 bg-indigo-950/60 border border-indigo-800/60 rounded p-2 text-indigo-200 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-indigo-400" /> Plain Language Hint
                    </span>

                    {/* Vernacular Speech Button */}
                    <button
                      onClick={() => handleSpeakText(field.id, explanation)}
                      disabled={!bengaliVoice}
                      title={bengaliVoice ? 'Read aloud in Bengali voice' : 'Bengali TTS voice unavailable on OS'}
                      className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 transition-all ${
                        bengaliVoice
                          ? speakingFieldId === field.id
                            ? 'bg-amber-600 text-white border-amber-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                          : 'bg-slate-800/50 text-slate-500 border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      {speakingFieldId === field.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-white" /> Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-amber-400" /> Listen (BN)
                        </>
                      )}
                    </button>
                  </div>
                  <p>{explanation}</p>
                  {field.contextHint && (
                    <p className="text-[10px] text-indigo-400/80 font-mono">
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
      <div className="flex gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={onScanClick}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg text-xs font-medium border border-slate-700 transition-all"
        >
          Re-scan DOM
        </button>
        <button
          onClick={onAutofillClick}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Review & Autofill
        </button>
      </div>
    </div>
  );
};
