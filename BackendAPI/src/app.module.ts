import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { RolModule } from './rol/rol.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TaxonomicModule } from './taxonomic/taxonomic.module';
import { LocationModule } from './location/location.module';
import { CollectionModule } from './collection/collection.module';
import { ObservationModule } from './observation/observation.module';
import { GeolocationModule } from './geolocation/geolocation.module';
import { EnvironmentModule } from './environment/environment.module';
import { ServiceModule } from './service/service.module';
import { ContactModule } from './contact/contact.module';
import { AuthorModule } from './author/author.module';
import { CasteModule } from './caste/caste.module';
import { ClimateDataModule } from './climate-data/climate-data.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    
    // Autenticacion y usuarios
    UsersModule, 
    RolModule, 
    AuthModule,
    
    // Taxonomic system modules
    TaxonomicModule,
    LocationModule,
    CollectionModule,
    ObservationModule,
    GeolocationModule,
    EnvironmentModule,
    ServiceModule,
    ContactModule,
    AuthorModule,
    CasteModule,
    ClimateDataModule,
    StatsModule
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
