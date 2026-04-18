import api from './api';

export interface GeocodeResult {
  address: string;
  city: string;
  state: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
  const res = await api.get('/geocode/reverse', { params: { lat, lng } });
  return res?.data ?? { address: '', city: '', state: '' };
}
