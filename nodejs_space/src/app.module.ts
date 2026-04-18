import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { OcrModule } from './ocr/ocr.module';
import { GeocodeModule } from './geocode/geocode.module';
import { TripsModule } from './trips/trips.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UploadModule,
    OcrModule,
    GeocodeModule,
    TripsModule,
    ReportsModule,
  ],
})
export class AppModule {}
