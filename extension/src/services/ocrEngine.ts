export * from '../engine/ocrAnomalyDetector';
import { analyzeDocument } from '../engine/ocrAnomalyDetector';
import { OCRResult } from '../types';

export async function processDocumentOCR(file: File, expectedName?: string): Promise<OCRResult> {
  const res = await analyzeDocument(file, expectedName || '');
  return {
    extractedText: res.extractedText,
    confidence: res.confidence,
    documentType: res.documentType,
    isFlaggedForManualReview: !res.isClean
  };
}
