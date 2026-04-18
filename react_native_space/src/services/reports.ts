import api from './api';

export interface Report {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  vehiclePlate: string | null;
  tripCount: number;
  totalKm: number;
  fileId: string;
  createdAt: string;
}

export interface ReportListResponse {
  items: Report[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GenerateReportResponse {
  reportUrl: string;
  fileName: string;
  tripCount: number;
  totalKm: number;
}

export async function generateReport(startDate: string, endDate: string, vehiclePlate?: string): Promise<GenerateReportResponse> {
  const body: Record<string, string> = { startDate, endDate };
  if (vehiclePlate) body.vehiclePlate = vehiclePlate;
  const res = await api.post('/reports/generate', body);
  return res?.data;
}

export async function listReports(page = 1, limit = 20): Promise<ReportListResponse> {
  const res = await api.get('/reports', { params: { page, limit } });
  return res?.data;
}

export async function getReportDownloadUrl(id: string): Promise<{ url: string; fileName: string }> {
  const res = await api.get(`/reports/${id}/download`);
  return res?.data;
}
