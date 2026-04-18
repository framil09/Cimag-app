import { Controller, Post, Get, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';

@ApiTags('Relatórios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('gestor')
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Gerar relatório PDF de viagens' })
  async generate(@Request() req: any, @Body() dto: GenerateReportDto) {
    return this.reportsService.generateReport(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar relatórios gerados' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listReports(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.listReports(
      req.user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Obter URL de download do relatório' })
  async getDownloadUrl(@Request() req: any, @Param('id') id: string) {
    return this.reportsService.getReportDownloadUrl(id, req.user.id);
  }
}
