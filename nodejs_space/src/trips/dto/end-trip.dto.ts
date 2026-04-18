import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class EndTripDto {
  @ApiProperty({ example: -23.5489 })
  @IsNumber({}, { message: 'Latitude final é obrigatória' })
  endLat: number;

  @ApiProperty({ example: -46.6388 })
  @IsNumber({}, { message: 'Longitude final é obrigatória' })
  endLng: number;

  @ApiProperty({ example: 'Rua Augusta, 500, São Paulo, SP' })
  @IsString()
  @IsNotEmpty({ message: 'Endereço final é obrigatório' })
  endAddress: string;

  @ApiProperty({ example: 45280 })
  @IsNumber({}, { message: 'Odômetro final é obrigatório' })
  endOdometer: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'ID da foto deve ser um UUID válido' })
  endOdometerPhotoId?: string;
}
