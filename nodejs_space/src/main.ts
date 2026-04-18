import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8081', 'http://localhost:8082', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger no-cache middleware
  const swaggerPath = 'api-docs';
  app.use(`/${swaggerPath}`, (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('CIMAG - Controle de Ve\u00edculos')
    .setDescription('API para rastreamento de viagens e controle de quilometragem de ve\u00edculos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'CIMAG - API de Ve\u00edculos',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #1a365d; font-size: 2em; }
      .swagger-ui .info .description { color: #4a5568; }
      .swagger-ui .opblock-tag { color: #2d3748; font-size: 1.1em; border-bottom: 2px solid #e2e8f0; }
      .swagger-ui .opblock .opblock-summary-method { font-weight: 700; }
      .swagger-ui .btn.execute { background-color: #2b6cb0; border-color: #2b6cb0; }
      .swagger-ui .btn.execute:hover { background-color: #1a4971; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    `,
  });

  await app.listen(3000);
  logger.log('Servi\u00e7o CIMAG rodando na porta 3000');
  logger.log(`Documenta\u00e7\u00e3o da API: http://localhost:3000/${swaggerPath}`);
}
bootstrap();
