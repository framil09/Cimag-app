import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteUploadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'cloud_storage_path é obrigatório' })
  cloud_storage_path: string;

  @ApiProperty({ example: 'odometro.jpg' })
  @IsString()
  @IsNotEmpty({ message: 'Nome do arquivo é obrigatório' })
  fileName: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @IsNotEmpty({ message: 'Tipo de conteúdo é obrigatório' })
  contentType: string;
}
