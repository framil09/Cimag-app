import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateReportDto {
  @ApiProperty({ example: '2026-01-01' })
  @IsDateString({}, { message: 'Data de início inválida' })
  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  startDate: string;

  @ApiProperty({ example: '2026-04-17' })
  @IsDateString({}, { message: 'Data de fim inválida' })
  @IsNotEmpty({ message: 'Data de fim é obrigatória' })
  endDate: string;

  @ApiPropertyOptional({ example: 'ABC-1234' })
  @IsOptional()
  @IsString()
  vehiclePlate?: string;
}
