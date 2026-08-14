import { Module } from '@nestjs/common';
import { TrapModule } from './trap/trap.module';
import { PreservationMethodModule } from './preservation-method/preservation-method.module';
import { PersonModule } from './person/person.module';
import { CollectionModule as SingleCollectionModule } from './collection/collection.module';

@Module({
  imports: [
    TrapModule,
    PreservationMethodModule,
    PersonModule,
    SingleCollectionModule,
  ],
  exports: [
    TrapModule,
    PreservationMethodModule,
    PersonModule,
    SingleCollectionModule,
  ]
})
export class CollectionModule {}
