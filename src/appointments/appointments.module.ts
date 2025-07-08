import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { DoctorTimeSlot } from 'src/availabilities/entities/doctor-timeslot.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, DoctorTimeSlot, Doctor]),AuthModule,
  ],
  
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  exports: [TypeOrmModule],
})
export class AppointmentsModule {}
