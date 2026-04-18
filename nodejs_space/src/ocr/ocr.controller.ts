import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OcrService } from './ocr.service';
import { OcrOdometerDto } from './dto/ocr.dto';

@ApiTags('OCR - Leitura de Odômetro')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('odometer')
  @ApiOperation({ summary: 'Extrair leitura do odômetro via OCR' })
  async extractOdometer(@Body() dto: OcrOdometerDto) {
    return this.ocrService.extractOdometerReading(dto.imageBase64);
  }
}
