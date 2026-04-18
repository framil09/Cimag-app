import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeocodeService {
  private readonly logger = new Logger(GeocodeService.name);

  async reverseGeocode(lat: number, lng: number): Promise<{ address: string; city: string; state: string }> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt-BR`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'CIMAG-VehicleTracking/1.0' },
      });

      if (!response.ok) {
        this.logger.error(`Nominatim retornou status ${response.status}`);
        return { address: `${lat}, ${lng}`, city: '', state: '' };
      }

      const data = await response.json();
      const addr = data.address || {};

      const road = addr.road || addr.pedestrian || addr.highway || '';
      const number = addr.house_number || '';
      const suburb = addr.suburb || addr.neighbourhood || '';
      const city = addr.city || addr.town || addr.village || addr.municipality || '';
      const state = addr.state || '';

      const parts = [road, number, suburb, city, state].filter(Boolean);
      const address = parts.join(', ') || data.display_name || `${lat}, ${lng}`;

      this.logger.log(`Geocodificação reversa: (${lat}, ${lng}) -> ${address}`);
      return { address, city, state };
    } catch (error) {
      this.logger.error(`Erro na geocodificação reversa: ${error}`);
      return { address: `${lat}, ${lng}`, city: '', state: '' };
    }
  }
}
