import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS origins via environment variable. Multiple origins supported, comma-separated.
  // Defaults cover local dev and production domain.
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
  
  // Apply JWT authentication guard globally
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  app.useGlobalGuards(new JwtAuthGuard(jwtService, reflector));
  
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
