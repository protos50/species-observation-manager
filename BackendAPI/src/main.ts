import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS origins via environment variable. Multiple origins supported, comma-separated.
  // Por defecto cubre el desarrollo local y el dominio de produccion.
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000,https://192-99-145-175.sslip.io')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Documentacion OpenAPI / Swagger UI, disponible en /api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Species Observation Manager API')
    .setDescription('API REST para el registro y gestion de datos taxonomicos del Laboratorio de Zoologia Agricola (FaCENA - UNNE).')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);
  
  // Guards globales. El orden importa: primero se autentica (JwtAuthGuard
  // valida el token y adjunta request.user) y recien despues se autoriza
  // (RolesGuard lee request.user.sub.role y lo contrasta con @Roles(...)).
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  app.useGlobalGuards(
    new JwtAuthGuard(jwtService, reflector),
    new RolesGuard(reflector),
  );
  
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
