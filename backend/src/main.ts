import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { logLevelsFrom } from './config/logger.config';
import { registerPgTypeParsers } from './config/pg-type-parser';

async function bootstrap() {
  registerPgTypeParsers();
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useLogger(logLevelsFrom(config.get<string>('LOG_LEVEL', 'log')));

  app.use(helmet());
  app.enableCors({ origin: config.get<string>('CORS_ORIGIN') });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  if (config.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Booking Webapp API')
      .setDescription('API per la gestione prenotazioni')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, document);
  }

  await app.listen(config.get<number>('PORT') ?? 3000);
}
void bootstrap();
