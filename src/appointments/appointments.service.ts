// appointments.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { DoctorTimeSlot } from 'src/availabilities/entities/doctor-timeslot.entity';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import * as dayjs from 'dayjs';
import { DoctorAvailability } from 'src/availabilities/entities/doctor-availability.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(DoctorTimeSlot)
    private readonly slotRepo: Repository<DoctorTimeSlot>,
    @InjectRepository(DoctorAvailability)
    private readonly availabilityRepo: Repository<DoctorAvailability>,
  ) {}

  async bookAppointment(dto: BookAppointmentDto, patientUserId: number) {
  const { doctor_id, date, start_time, end_time } = dto;

  const doctor = await this.doctorRepo.findOne({ where: { user_id: doctor_id } });
  if (!doctor) throw new NotFoundException('Doctor not found');
  const normalizedStart = dayjs(`${date} ${start_time}`, ['HH:mm', 'HH:mm:ss']).format('HH:mm:ss');
  const normalizedEnd = dayjs(`${date} ${end_time}`, ['HH:mm', 'HH:mm:ss']).format('HH:mm:ss');

  const slot = await this.slotRepo.findOne({
    where: {
      user_id: doctor_id,
      date,
      start_time: normalizedStart,
      end_time: normalizedEnd,
    },
  });
  if (!slot) throw new NotFoundException('Slot not found');

  const slotStartDateTime = dayjs(`${slot.date} ${slot.start_time}`);
  const now = dayjs();

  const today = dayjs().format('YYYY-MM-DD');
  if (slot.booking_start_time) {
    const bookingStart = dayjs(`${slot.date} ${slot.booking_start_time}`);
    if (slot.date === today && now.isBefore(bookingStart)) {
      throw new ForbiddenException('Booking not yet allowed for this slot');
    }
  }

  if (slot.booking_end_time) {
    const bookingEnd = dayjs(`${slot.date} ${slot.booking_end_time}`);
    if (slot.date === today && now.isAfter(bookingEnd)) {
      throw new ForbiddenException('Booking time for this slot has passed');
    }
  }

    if (!slotStartDateTime.isValid() || slotStartDateTime.isBefore(dayjs())) {
      throw new ConflictException('Invalid or past slot start time');
    }

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

    const hour = slotStartDateTime.hour();
    const session = hour < 12 ? 'MORNING' : 'EVENING';

const query = this.appointmentRepo
  .createQueryBuilder('appointment')
  .innerJoin(DoctorTimeSlot, 'slot', 'appointment.slot_id = slot.id')
  .where('appointment.patient_user_id = :patientId', { patientId: patientUserId })
  .andWhere('appointment.doctor_user_id = :doctorId', { doctorId: doctor_id })
  .andWhere('slot.date = :date', { date: slot.date });

if (session === 'MORNING') {
  query.andWhere('EXTRACT(HOUR FROM slot.start_time) < 12');
} else {
  query.andWhere('EXTRACT(HOUR FROM slot.start_time) >= 12');
}

const sameSessionBooking = await query.getOne();

if (sameSessionBooking) {
  throw new ConflictException(
    'You have already booked a slot in this session with this doctor.',
  );
}

  const existingAppointments = await this.appointmentRepo.find({
    where: { slot_id: slot.id },
    order: { created_at: 'ASC' },
  });
  
  let reporting_time: Date;
  const patients_per_slot = slot.patients_per_slot ?? (doctor.schedule_Type === 'wave' ? 3 : 1);
  
  if (doctor.schedule_Type === 'wave') {
    const slot_duration = slot.slot_duration ?? 30;
    
  
  if (!slot_duration || !patients_per_slot) {
    throw new ConflictException('Invalid slot configuration');
  }
  
    const perPatientOffset = Math.floor(slot_duration / patients_per_slot);
    const nextIndex = existingAppointments.length;
  
  if (nextIndex >= patients_per_slot) {
    throw new ConflictException('Slot fully booked');
  }
  
  reporting_time = dayjs(`${slot.date} ${slot.start_time}`)
    .add(perPatientOffset * nextIndex, 'minute')
    .toDate();
  } else {
    reporting_time = dayjs(`${slot.date} ${slot.start_time}`).toDate();
  }
  

  // Update slot
  slot.booked_count += 1;
  if (slot.booked_count >= patients_per_slot) {
    slot.is_available = false;
  }

  await this.slotRepo.save(slot);

   // ✅ Calculate scheduled_on
  const scheduled_on = new Date();

  

  const appointment = this.appointmentRepo.create({
    doctor_user_id: doctor_id,
    patient_user_id: patientUserId,
    slot_id: slot.id,
    reporting_time,
    scheduled_on,
  });

  const saved = await this.appointmentRepo.save(appointment);

  
  return {
    id: saved.id,
    doctor_user_id: saved.doctor_user_id,
    patient_user_id: saved.patient_user_id,
    slot_id: saved.slot_id,
    reporting_time,
    scheduled_on,
    slot_date: slot.date,
    slot_start_time: slot.start_time,
  };
}


async getFilteredAppointmentsByRole(
  userId: number,
  role: 'doctor' | 'patient',
  type: 'upcoming' | 'past' | 'cancelled'
) {
  const today = dayjs().format('YYYY-MM-DD');

  const qb = this.appointmentRepo
    .createQueryBuilder('appointment')
    .leftJoinAndSelect('appointment.slot', 'slot')
    .where(`appointment.${role}_user_id = :userId`, { userId });

  if (type === 'cancelled') {
    qb.andWhere('appointment.status = :status', { status: 'cancelled' });
  } else {
    qb.andWhere('appointment.status = :status', { status: 'booked' });

    if (type === 'upcoming') {
      qb.andWhere('slot.date >= :today', { today });
    } else if (type === 'past') {
      qb.andWhere('slot.date < :today', { today });
    }
  }

  return qb.orderBy('slot.date', 'DESC').getMany();
}

async cancelAppointment(userId: number, appointmentId: number) {
  const appointment = await this.appointmentRepo.findOne({
    where: { id: appointmentId },
    relations: ['slot'],
  });

  if (!appointment) throw new NotFoundException('Appointment not found');

  const isDoctor = appointment.doctor_user_id === userId;
  const isPatient = appointment.patient_user_id === userId;

  if (!isDoctor && !isPatient) {
    throw new ForbiddenException('You are not allowed to cancel this appointment');
  }

  if (appointment.status === 'cancelled') {
    throw new ConflictException('Appointment already cancelled');
  }

  appointment.status = 'cancelled';
  await this.appointmentRepo.save(appointment);

  return {
    message: 'Appointment cancelled successfully',
    appointment_id: appointment.id,
    cancelled_by: isDoctor ? 'doctor' : 'patient',
  };
}







}
