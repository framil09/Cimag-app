import api from './api';

export interface PresignedResponse {
  uploadUrl: string;
  cloud_storage_path: string;
}

export interface FileRecord {
  id: string;
  cloud_storage_path: string;
  fileName: string;
}

export async function getPresignedUrl(fileName: string, contentType: string): Promise<PresignedResponse> {
  const res = await api.post('/upload/presigned', { fileName, contentType, isPublic: false });
  return res?.data;
}

export async function completeUpload(cloud_storage_path: string, fileName: string, contentType: string): Promise<FileRecord> {
  const res = await api.post('/upload/complete', { cloud_storage_path, fileName, contentType });
  return res?.data;
}

export async function getFileUrl(fileId: string, mode: 'view' | 'download' = 'view'): Promise<{ url: string }> {
  const res = await api.get(`/files/${fileId}/url`, { params: { mode } });
  return res?.data;
}

export async function uploadFileToS3(uri: string, fileName: string, contentType: string): Promise<FileRecord> {
  // 1. Get presigned URL
  const { uploadUrl, cloud_storage_path } = await getPresignedUrl(fileName, contentType);
  
  // 2. Upload to S3
  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();
  
  // Check if content-disposition header needed
  const headers: Record<string, string> = { 'Content-Type': contentType };
  if (uploadUrl?.includes('content-disposition')) {
    headers['Content-Disposition'] = 'attachment';
  }
  
  await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers,
  });
  
  // 3. Complete upload
  const record = await completeUpload(cloud_storage_path, fileName, contentType);
  return record;
}
