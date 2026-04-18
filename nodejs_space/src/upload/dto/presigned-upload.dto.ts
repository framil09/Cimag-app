import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class PresignedUploadDto {
  @ApiProperty({ example: 'odometro.jpg' })
  @IsString()
  @IsNotEmpty({ message: 'Nome do arquivo é obrigatório' })
  fileName: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @IsNotEmpty({ message: 'Tipo de conteúdo é obrigatório' })
  contentType: string;

  @ApiProperty({ example: false })
  @IsBoolean({ message: 'isPublic deve ser um booleano' })
  isPublic: boolean;
}
