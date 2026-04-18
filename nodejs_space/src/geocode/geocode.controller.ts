import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GeocodeService } from './geocode.service';

@ApiTags('Geocodificação')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/geocode')
export class GeocodeController {
  constructor(private readonly geocodeService: GeocodeService) {}

  @Get('reverse')
  @ApiOperation({ summary: 'Converter coordenadas GPS em endereço' })
  @ApiQuery({ name: 'lat', type: Number, required: true })
  @ApiQuery({ name: 'lng', type: Number, required: true })
  async reverseGeocode(@Query('lat') lat: string, @Query('lng') lng: string) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Coordenadas inválidas');
    }
    return this.geocodeService.reverseGeocode(latitude, longitude);
  }
}
