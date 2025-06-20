import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeSlot } from './entities/timeslot.entity';
@Module({
    imports: [TypeOrmModule.forFeature([TimeSlot])],
    exports: [TypeOrmModule],
})
export class TimeslotsModule {}
