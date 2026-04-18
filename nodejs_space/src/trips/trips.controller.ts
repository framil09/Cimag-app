import {
  Controller, Post, Get, Patch, Delete, Body, Param, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TripsService } from './trips.service';
import { StartTripDto } from './dto/start-trip.dto';
import { EndTripDto } from './dto/end-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@ApiTags('Viagens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Iniciar uma viagem' })
  async startTrip(@Request() req: any, @Body() dto: StartTripDto) {
    return this.tripsService.startTrip(req.user.id, req.user.name, dto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Obter viagem ativa do usuário' })
  async getActiveTrip(@Request() req: any) {
    return this.tripsService.getActiveTrip(req.user.id);
  }

  @Get('stats/monthly')
  @ApiOperation({ summary: 'Estatísticas mensais do usuário' })
  async getMonthlyStats(@Request() req: any) {
    return this.tripsService.getMonthlyStats(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar viagens do usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'vehiclePlate', required: false, type: String })
  async listTrips(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('vehiclePlate') vehiclePlate?: string,
  ) {
    return this.tripsService.listTrips(
      req.user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      startDate,
      endDate,
      vehiclePlate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma viagem' })
  async getTripById(@Request() req: any, @Param('id') id: string) {
    return this.tripsService.getTripById(id, req.user.id);
  }

  @Patch(':id/end')
  @ApiOperation({ summary: 'Finalizar uma viagem' })
  async endTrip(@Request() req: any, @Param('id') id: string, @Body() dto: EndTripDto) {
    return this.tripsService.endTrip(id, req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de uma viagem' })
  async updateTrip(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateTripDto) {
    return this.tripsService.updateTrip(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma viagem' })
  async deleteTrip(@Request() req: any, @Param('id') id: string) {
    return this.tripsService.deleteTrip(id, req.user.id);
  }
}
