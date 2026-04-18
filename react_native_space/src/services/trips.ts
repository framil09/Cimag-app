import api from './api';

export interface Trip {
  id: string;
  vehiclePlate: string;
  purpose: string;
  driverName: string;
  userId: string;
  startLat: number;
  startLng: number;
  startAddress: string;
  startOdometer: number;
  startOdometerPhotoId: string | null;
  endLat: number | null;
  endLng: number | null;
  endAddress: string | null;
  endOdometer: number | null;
  endOdometerPhotoId: string | null;
  distance: number | null;
  startedAt: string;
  endedAt: string | null;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface TripListResponse {
  items: Trip[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MonthlyStats {
  tripCount: number;
  totalKm: number;
  month: number;
  year: number;
}

export interface StartTripPayload {
  vehiclePlate: string;
  purpose: string;
  startLat: number;
  startLng: number;
  startAddress: string;
  startOdometer: number;
  startOdometerPhotoId?: string;
}

export interface EndTripPayload {
  endLat: number;
  endLng: number;
  endAddress: string;
  endOdometer: number;
  endOdometerPhotoId?: string;
}

export async function startTrip(payload: StartTripPayload): Promise<Trip> {
  const res = await api.post('/trips/start', payload);
  return res?.data;
}

export async function getActiveTrip(): Promise<{ trip: Trip | null }> {
  const res = await api.get('/trips/active');
  return res?.data;
}

export async function endTrip(tripId: string, payload: EndTripPayload): Promise<Trip> {
  const res = await api.patch(`/trips/${tripId}/end`, payload);
  return res?.data;
}

export async function listTrips(params: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  vehiclePlate?: string;
}): Promise<TripListResponse> {
  const res = await api.get('/trips', { params });
  return res?.data;
}

export async function getTripById(id: string): Promise<Trip> {
  const res = await api.get(`/trips/${id}`);
  return res?.data;
}

export async function updateTrip(id: string, data: Partial<{
  vehiclePlate: string;
  purpose: string;
  startAddress: string;
  endAddress: string;
  startOdometer: number;
  endOdometer: number;
}>): Promise<Trip> {
  const res = await api.patch(`/trips/${id}`, data);
  return res?.data;
}

export async function deleteTrip(id: string): Promise<{ success: boolean }> {
  const res = await api.delete(`/trips/${id}`);
  return res?.data;
}

export async function getMonthlyStats(): Promise<MonthlyStats> {
  const res = await api.get('/trips/stats/monthly');
  return res?.data;
}
