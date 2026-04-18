import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTripDto {
  @ApiPropertyOptional({ example: 'ABC-1234' })
  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @ApiPropertyOptional({ example: 'Visita a cliente' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({ example: 'Av. Paulista, 1000' })
  @IsOptional()
  @IsString()
  startAddress?: string;

  @ApiPropertyOptional({ example: 'Rua Augusta, 500' })
  @IsOptional()
  @IsString()
  endAddress?: string;

  @ApiPropertyOptional({ example: 45230 })
  @IsOptional()
  @IsNumber()
  startOdometer?: number;

  @ApiPropertyOptional({ example: 45280 })
  @IsOptional()
  @IsNumber()
  endOdometer?: number;
}
