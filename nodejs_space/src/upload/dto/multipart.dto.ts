import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class InitiateMultipartDto {
  @ApiProperty({ example: 'video_grande.mp4' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isPublic: boolean;
}

export class MultipartPartDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cloud_storage_path: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  partNumber: number;
}

export class PartInfo {
  @ApiProperty()
  @IsString()
  ETag: string;

  @ApiProperty()
  @IsInt()
  PartNumber: number;
}

export class CompleteMultipartDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cloud_storage_path: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({ type: [PartInfo] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartInfo)
  parts: PartInfo[];
}
