import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { DoctorTimeSlot } from './entities/doctor-timeslot.entity';
import { AvailabilitiesService } from './availabilities.service';
import { AvailabilitiesController } from './availabilities.controller';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoctorAvailability,
      DoctorTimeSlot,
      Doctor
    ]),
    AuthModule
  ],
  controllers: [AvailabilitiesController],
  providers: [AvailabilitiesService],
  exports: [TypeOrmModule],
})
export class AvailabilitiesModule {}
