import api from './api';

export interface OcrResult {
  reading: number | null;
  confidence: string;
  rawText: string;
}

export async function extractOdometerReading(imageBase64: string): Promise<OcrResult> {
  const res = await api.post('/ocr/odometer', { imageBase64 });
  return res?.data ?? { reading: null, confidence: 'low', rawText: '' };
}
