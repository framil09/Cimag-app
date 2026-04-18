import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class StartTripDto {
  @ApiProperty({ example: 'ABC-1234' })
  @IsString()
  @IsNotEmpty({ message: 'Placa do veículo é obrigatória' })
  vehiclePlate: string;

  @ApiProperty({ example: 'Visita a cliente' })
  @IsString()
  @IsNotEmpty({ message: 'Finalidade é obrigatória' })
  purpose: string;

  @ApiProperty({ example: -23.5505 })
  @IsNumber({}, { message: 'Latitude inicial é obrigatória' })
  startLat: number;

  @ApiProperty({ example: -46.6333 })
  @IsNumber({}, { message: 'Longitude inicial é obrigatória' })
  startLng: number;

  @ApiProperty({ example: 'Av. Paulista, 1000, São Paulo, SP' })
  @IsString()
  @IsNotEmpty({ message: 'Endereço inicial é obrigatório' })
  startAddress: string;

  @ApiProperty({ example: 45230 })
  @IsNumber({}, { message: 'Odômetro inicial é obrigatório' })
  startOdometer: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'ID da foto deve ser um UUID válido' })
  startOdometerPhotoId?: string;
}
