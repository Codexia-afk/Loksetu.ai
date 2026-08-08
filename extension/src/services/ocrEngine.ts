import { createWorker } from 'tesseract.js';
import { OCRResult } from '../types';

export async function processDocumentOCR(
  file: File,
  documentType: 'aadhaar' | 'land_record' | 'bank_passbook'
): Promise<OCRResult> {
  const worker = await createWorker(['eng', 'ben']);

  try {
    const ret = await worker.recognize(file);
    const text = ret.data.text;
    const confidence = ret.data.confidence;

    let issueDate: string | undefined = undefined;
    let certificateNumber: string | undefined = undefined;
    let nameFound: string | undefined = undefined;

    // Regex match patterns for date & serial numbers
    const dateMatch = text.match(/(\d{2}[\/\.-]\d{2}[\/\.-]\d{4})/);
    if (dateMatch) issueDate = dateMatch[1];

    const certMatch = text.match(/(?:Khatiyan|RoR|No|ID)[:\s]*([A-Z0-9\/-]{4,15})/i);
    if (certMatch) certificateNumber = certMatch[1];

    const nameMatch = text.match(/(?:Name|Full Name)[:\s]*([A-Za-z\s]{3,25})/i);
    if (nameMatch) nameFound = nameMatch[1].trim();

    // Constraint 6: Confidence threshold check (< 75% flags manual review)
    const isFlaggedForManualReview = confidence < 75;

    await worker.terminate();

    return {
      extractedText: text.substring(0, 300),
      confidence,
      documentType,
      issueDate,
      certificateNumber,
      nameFound,
      isFlaggedForManualReview
    };
  } catch (err) {
    await worker.terminate();
    return {
      extractedText: 'OCR processing error.',
      confidence: 0,
      documentType,
      isFlaggedForManualReview: true
    };
  }
}
