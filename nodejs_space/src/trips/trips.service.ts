import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartTripDto } from './dto/start-trip.dto';
import { EndTripDto } from './dto/end-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async startTrip(userId: string, driverName: string, dto: StartTripDto) {
    const existingActive = await this.prisma.trip.findFirst({
      where: { userId, status: 'active' },
    });
    if (existingActive) {
      throw new ConflictException('Você já possui uma viagem ativa. Finalize-a antes de iniciar outra.');
    }

    const trip = await this.prisma.trip.create({
      data: {
        userId,
        driverName,
        vehiclePlate: dto.vehiclePlate.toUpperCase(),
        purpose: dto.purpose,
        status: 'active',
        startLat: dto.startLat,
        startLng: dto.startLng,
        startAddress: dto.startAddress,
        startOdometer: dto.startOdometer,
        startOdometerPhotoId: dto.startOdometerPhotoId || null,
        startedAt: new Date(),
      },
    });
    this.logger.log(`Viagem iniciada: ${trip.id} por ${driverName}`);
    return trip;
  }

  async getActiveTrip(userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { userId, status: 'active' },
      orderBy: { startedAt: 'desc' },
    });
    return { trip };
  }

  async endTrip(tripId: string, userId: string, dto: EndTripDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Viagem não encontrada');
    if (trip.userId !== userId) throw new ForbiddenException('Sem permissão');
    if (trip.status === 'completed') throw new BadRequestException('Viagem já finalizada');
    if (dto.endOdometer < trip.startOdometer) {
      throw new BadRequestException('Odômetro final deve ser maior ou igual ao inicial');
    }

    const distance = dto.endOdometer - trip.startOdometer;
    const updated = await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        endLat: dto.endLat,
        endLng: dto.endLng,
        endAddress: dto.endAddress,
        endOdometer: dto.endOdometer,
        endOdometerPhotoId: dto.endOdometerPhotoId || null,
        distance,
        status: 'completed',
        endedAt: new Date(),
      },
    });
    this.logger.log(`Viagem finalizada: ${tripId}, distância: ${distance} km`);
    return updated;
  }

  async listTrips(
    userId: string,
    page = 1,
    limit = 20,
    startDate?: string,
    endDate?: string,
    vehiclePlate?: string,
  ) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = new Date(startDate);
      if (endDate) where.startedAt.lte = new Date(endDate);
    }
    if (vehiclePlate) where.vehiclePlate = vehiclePlate.toUpperCase();

    const [items, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.trip.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getTripById(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Viagem não encontrada');
    if (trip.userId !== userId) throw new ForbiddenException('Sem permissão');
    return trip;
  }

  async updateTrip(tripId: string, userId: string, dto: UpdateTripDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Viagem não encontrada');
    if (trip.userId !== userId) throw new ForbiddenException('Sem permissão');

    const data: any = {};
    if (dto.vehiclePlate !== undefined) data.vehiclePlate = dto.vehiclePlate.toUpperCase();
    if (dto.purpose !== undefined) data.purpose = dto.purpose;
    if (dto.startAddress !== undefined) data.startAddress = dto.startAddress;
    if (dto.endAddress !== undefined) data.endAddress = dto.endAddress;
    if (dto.startOdometer !== undefined) data.startOdometer = dto.startOdometer;
    if (dto.endOdometer !== undefined) data.endOdometer = dto.endOdometer;

    // Recalculate distance if odometers changed
    const newStart = data.startOdometer ?? trip.startOdometer;
    const newEnd = data.endOdometer ?? trip.endOdometer;
    if (newEnd !== null && newEnd !== undefined) {
      data.distance = newEnd - newStart;
    }

    const updated = await this.prisma.trip.update({ where: { id: tripId }, data });
    return updated;
  }

  async deleteTrip(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Viagem não encontrada');
    if (trip.userId !== userId) throw new ForbiddenException('Sem permissão');
    await this.prisma.trip.delete({ where: { id: tripId } });
    this.logger.log(`Viagem excluída: ${tripId}`);
    return { success: true };
  }

  async getMonthlyStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const trips = await this.prisma.trip.findMany({
      where: {
        userId,
        startedAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const totalKm = trips.reduce((sum: number, t: any) => sum + (t.distance || 0), 0);
    return {
      tripCount: trips.length,
      totalKm: Math.round(totalKm * 100) / 100,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
  }
}
