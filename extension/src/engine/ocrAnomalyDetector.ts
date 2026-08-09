import { createWorker } from 'tesseract.js';
import { OCRAnomalyResult } from '../types';

/**
 * Analyzes an uploaded document using Tesseract.js (English + Bengali) locally.
 * Performs anomaly detection for name mismatches, low confidence (<75%), and expired document dates.
 */
export async function analyzeDocument(
  imageFile: File | Blob,
  expectedName: string,
  currentYear: number = new Date().getFullYear(),
  documentType: string = 'Aadhaar / Land Document'
): Promise<OCRAnomalyResult> {
  const worker = await createWorker(['eng', 'ben']);
  const ret = await worker.recognize(imageFile);
  await worker.terminate();

  const extractedText = ret.data.text || '';
  const confidence = Math.round(ret.data.confidence || 0);

  const anomalies: string[] = [];

  // 1. Confidence check (< 75%)
  if (confidence < 75) {
    anomalies.push(`Low OCR confidence (${confidence}% < 75%). Please verify document manually.`);
  }

  // 2. Name discrepancy check
  if (expectedName && expectedName.trim().length > 0) {
    const cleanExpected = expectedName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanExtracted = extractedText.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check partial token match
    const nameTokens = expectedName.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const matchesCount = nameTokens.filter(t => cleanExtracted.includes(t)).length;

    if (!cleanExtracted.includes(cleanExpected) && matchesCount < Math.min(2, nameTokens.length)) {
      anomalies.push(`Name discrepancy: Expected '${expectedName}' but OCR could not reliably verify match on document.`);
    }
  }

  // 3. Expired Date detection (e.g. valid till 2020)
  const dateRegex = /(?:valid till|expiry|exp|validity):\s*(\d{2}[\/\.-]\d{2}[\/\.-]\d{4}|\d{4})/i;
  const match = extractedText.match(dateRegex);
  if (match) {
    const dateStr = match[1];
    const yearMatch = dateStr.match(/\d{4}/);
    if (yearMatch) {
      const expYear = parseInt(yearMatch[0], 10);
      if (expYear < currentYear) {
        anomalies.push(`Expired Document: Document indicates validity ended in ${expYear} (Current year: ${currentYear}).`);
      }
    }
  }

  // Clean flag condition: confidence >= 75 and 0 critical anomalies
  const isClean = confidence >= 75 && anomalies.length === 0;

  return {
    documentType,
    extractedText,
    confidence,
    anomaliesFound: anomalies,
    isClean
  };
}
