// appointments.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { DoctorTimeSlot } from 'src/availabilities/entities/doctor-timeslot.entity';
import { BookAppointmentDto } from './dto/book-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(DoctorTimeSlot)
    private readonly slotRepo: Repository<DoctorTimeSlot>,
  ) {}

  async bookAppointment(dto: BookAppointmentDto, patientUserId: number) {
  const { doctor_id, date, start_time, end_time } = dto;

  const doctor = await this.doctorRepo.findOne({ where: { user_id: doctor_id } });
  if (!doctor) throw new NotFoundException('Doctor not found');

  const slot = await this.slotRepo.findOne({
    where: {
      user_id: doctor_id,
      date,
      start_time,
      end_time,
    },
  });
  if (!slot) throw new NotFoundException('Slot not found');

  const existing = await this.appointmentRepo.findOne({
  where: {
    doctor_user_id: doctor_id,
    patient_user_id: patientUserId,
    slot_id: slot.id, 
  },
});

    if (existing) {
      throw new ConflictException('You have already booked this slot');
    }

  if (doctor.schedule_Type === 'stream') {
    if (!slot.is_available) throw new ConflictException('Slot already booked');
    slot.is_available = false;
  } else {
    if (slot.booked_count >= slot.max_bookings) {
      throw new ConflictException('Slot fully booked');
    }
    slot.booked_count += 1;
    if (slot.booked_count >= slot.max_bookings) {
      slot.is_available = false;
    }
  }

  await this.slotRepo.save(slot);

  const appointment = this.appointmentRepo.create({
    doctor_user_id: doctor_id,
    patient_user_id: patientUserId,
    slot_id: slot.id,
  });

  return this.appointmentRepo.save(appointment);
}

}
