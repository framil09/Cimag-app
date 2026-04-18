import {
  Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Request,
  NotFoundException, Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { PresignedUploadDto } from './dto/presigned-upload.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { InitiateMultipartDto, MultipartPartDto, CompleteMultipartDto } from './dto/multipart.dto';
import * as s3 from '../lib/s3';

@ApiTags('Upload de Arquivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Post('upload/presigned')
  @ApiOperation({ summary: 'Gerar URL pré-assinada para upload' })
  async getPresignedUrl(@Body() dto: PresignedUploadDto) {
    const result = await s3.generatePresignedUploadUrl(dto.fileName, dto.contentType, dto.isPublic);
    return result;
  }

  @Post('upload/complete')
  @ApiOperation({ summary: 'Confirmar upload e salvar no banco' })
  async completeUpload(@Request() req: any, @Body() dto: CompleteUploadDto) {
    const file = await this.prisma.file.create({
      data: {
        userId: req.user.id,
        fileName: dto.fileName,
        cloud_storage_path: dto.cloud_storage_path,
        isPublic: dto.cloud_storage_path.includes('/public/'),
        contentType: dto.contentType,
      },
    });
    this.logger.log(`Upload concluído: ${file.id} - ${file.fileName}`);
    return { id: file.id, cloud_storage_path: file.cloud_storage_path, fileName: file.fileName };
  }

  @Post('upload/multipart/initiate')
  @ApiOperation({ summary: 'Iniciar upload multipart' })
  async initiateMultipart(@Body() dto: InitiateMultipartDto) {
    return s3.initiateMultipartUpload(dto.fileName, dto.isPublic);
  }

  @Post('upload/multipart/part')
  @ApiOperation({ summary: 'Obter URL pré-assinada para uma parte' })
  async getPartUrl(@Body() dto: MultipartPartDto) {
    const url = await s3.getPresignedUrlForPart(dto.cloud_storage_path, dto.uploadId, dto.partNumber);
    return { uploadUrl: url };
  }

  @Post('upload/multipart/complete')
  @ApiOperation({ summary: 'Finalizar upload multipart' })
  async completeMultipart(@Body() dto: CompleteMultipartDto) {
    await s3.completeMultipartUpload(dto.cloud_storage_path, dto.uploadId, dto.parts);
    return { success: true, cloud_storage_path: dto.cloud_storage_path };
  }

  @Get('files/:id/url')
  @ApiOperation({ summary: 'Obter URL do arquivo' })
  @ApiQuery({ name: 'mode', required: false, enum: ['view', 'download'] })
  async getFileUrl(@Param('id') id: string, @Query('mode') mode?: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Arquivo não encontrado');
    const url = await s3.getFileUrl(file.cloud_storage_path, file.isPublic);
    return { url };
  }

  @Delete('files/:id')
  @ApiOperation({ summary: 'Excluir arquivo' })
  async deleteFile(@Param('id') id: string, @Request() req: any) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Arquivo não encontrado');
    await s3.deleteFile(file.cloud_storage_path);
    await this.prisma.file.delete({ where: { id } });
    this.logger.log(`Arquivo excluído: ${id}`);
    return { success: true };
  }
}
