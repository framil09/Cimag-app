import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import PDFDocument from 'pdfkit';
import { getFileUrl } from '../lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client, getBucketConfig } from '../lib/aws-config';

let _s3Client: ReturnType<typeof createS3Client> | null = null;
function getS3Client() {
  if (!_s3Client) _s3Client = createS3Client();
  return _s3Client;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async generateReport(userId: string, dto: GenerateReportDto) {
    const where: any = {
      userId,
      status: 'completed',
      startedAt: {
        gte: new Date(dto.startDate),
        lte: new Date(dto.endDate + 'T23:59:59.999Z'),
      },
    };
    if (dto.vehiclePlate) where.vehiclePlate = dto.vehiclePlate.toUpperCase();

    const trips = await this.prisma.trip.findMany({
      where,
      orderBy: { startedAt: 'asc' },
    });

    const totalKm = trips.reduce((sum: number, t: any) => sum + (t.distance || 0), 0);

    // Generate PDF
    const pdfBuffer = await this.buildPdf(trips, dto, totalKm, userId);

    // Upload PDF to S3
    const fileName = `relatorio_${dto.startDate}_${dto.endDate}_${Date.now()}.pdf`;
    const { bucketName, folderPrefix } = getBucketConfig();
    const cloud_storage_path = `${folderPrefix}reports/${Date.now()}-${fileName}`;

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: cloud_storage_path,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      }),
    );

    // Save file record
    const file = await this.prisma.file.create({
      data: {
        userId,
        fileName,
        cloud_storage_path,
        isPublic: false,
        contentType: 'application/pdf',
      },
    });

    // Save report record
    const report = await this.prisma.report.create({
      data: {
        userId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        vehiclePlate: dto.vehiclePlate?.toUpperCase() || null,
        tripCount: trips.length,
        totalKm: Math.round(totalKm * 100) / 100,
        fileId: file.id,
      },
    });

    const reportUrl = await getFileUrl(cloud_storage_path, false);
    this.logger.log(`Relatório gerado: ${report.id}, ${trips.length} viagens, ${totalKm} km`);

    return {
      reportUrl,
      fileName,
      tripCount: trips.length,
      totalKm: Math.round(totalKm * 100) / 100,
    };
  }

  async listReports(userId: string, page = 1, limit = 20) {
    const where = { userId };
    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getReportDownloadUrl(reportId: string, userId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: { file: true },
    });
    if (!report) throw new NotFoundException('Relatório não encontrado');
    if (report.userId !== userId) throw new NotFoundException('Relatório não encontrado');

    const url = await getFileUrl(report.file.cloud_storage_path, false);
    return { url, fileName: report.file.fileName };
  }

  private async buildPdf(
    trips: any[],
    dto: GenerateReportDto,
    totalKm: number,
    userId: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('CIMAG', { align: 'center' });
      doc.fontSize(14).text('Relatório de Controle de Ve\u00edculos', { align: 'center' });
      doc.moveDown();

      // Period info
      const startFormatted = this.formatDate(dto.startDate);
      const endFormatted = this.formatDate(dto.endDate);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Per\u00edodo: ${startFormatted} a ${endFormatted}`);
      if (dto.vehiclePlate) {
        doc.text(`Ve\u00edculo: ${dto.vehiclePlate.toUpperCase()}`);
      }
      doc.text(`Total de viagens: ${trips.length}`);
      doc.text(`Quilometragem total: ${(Math.round(totalKm * 100) / 100).toLocaleString('pt-BR')} km`);
      doc.moveDown();

      // Table header
      doc.font('Helvetica-Bold').fontSize(9);
      const tableTop = doc.y;
      const colWidths = [70, 60, 120, 120, 55, 55];
      const headers = ['Data', 'Placa', 'Origem', 'Destino', 'Km In\u00ed.', 'Km Fim'];
      let xPos = 50;
      headers.forEach((h, i) => {
        doc.text(h, xPos, tableTop, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i] + 5;
      });

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);

      // Table rows
      doc.font('Helvetica').fontSize(8);
      for (const trip of trips) {
        if (doc.y > 720) {
          doc.addPage();
          doc.y = 50;
        }

        const rowY = doc.y;
        xPos = 50;
        const rowData = [
          this.formatDateTime(trip.startedAt),
          trip.vehiclePlate,
          trip.startAddress?.substring(0, 30) || '-',
          trip.endAddress?.substring(0, 30) || '-',
          trip.startOdometer?.toLocaleString('pt-BR') || '-',
          trip.endOdometer?.toLocaleString('pt-BR') || '-',
        ];
        rowData.forEach((val, i) => {
          doc.text(val, xPos, rowY, { width: colWidths[i], align: 'left' });
          xPos += colWidths[i] + 5;
        });
        doc.moveDown(0.8);
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).font('Helvetica').fillColor('gray');
      doc.text(
        `Gerado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
        { align: 'center' },
      );

      doc.end();
    });
  }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  }

  private formatDateTime(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
