import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OcrOdometerDto {
  @ApiProperty({ description: 'Imagem em base64' })
  @IsString()
  @IsNotEmpty({ message: 'Imagem base64 é obrigatória' })
  imageBase64: string;
}
