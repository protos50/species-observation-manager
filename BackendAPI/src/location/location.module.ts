import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module';
import { ProvinceModule } from './province/province.module';
import { DepartmentModule } from './department/department.module';
import { LocalityModule } from './locality/locality.module';

@Module({
  imports: [
    CountryModule,
    ProvinceModule,
    DepartmentModule,
    LocalityModule
  ],
  exports: [
    CountryModule,
    ProvinceModule,
    DepartmentModule,
    LocalityModule
  ]
})
export class LocationModule {}
