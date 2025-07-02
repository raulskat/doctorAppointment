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
import * as dayjs from 'dayjs';

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

    const hour = new Date(start_time).getHours();
const session = hour < 12 ? 'MORNING' : 'EVENING';

const sameSessionBooking = await this.appointmentRepo
  .createQueryBuilder('appointment')
  .innerJoin(DoctorTimeSlot, 'slot', 'appointment.slot_id = slot.id')
  .where('appointment.patient_user_id = :patientId', { patientId: patientUserId })
  .andWhere('appointment.doctor_user_id = :doctorId', { doctorId: doctor_id })
  .andWhere('slot.date = :date', { date })
  .andWhere('EXTRACT(HOUR FROM slot.start_time) < 12 = :isMorning', {
    isMorning: session === 'MORNING',
  })
  .getOne();

if (sameSessionBooking) {
  throw new ConflictException(
    'You have already booked a slot in this session with this doctor.',
  );
}


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

   // ✅ Calculate scheduled_on
  const scheduled_on = new Date();

  // ✅ Calculate reporting_time
  let reporting_time: Date;
  if (doctor.schedule_Type === 'stream') {
    reporting_time = dayjs(`${slot.date} ${slot.start_time}`).toDate();
  } else {
    const alreadyBooked = await this.appointmentRepo.count({ where: { slot_id: slot.id } });
    const slotDuration = 10; // minutes (can be made configurable)
    reporting_time = dayjs(`${slot.date} ${slot.start_time}`)
      .add(slotDuration * alreadyBooked, 'minute')
      .toDate();
  }

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
  };
}

async getPatientAppointments(patientId: number) {
  return this.appointmentRepo.find({
    where: {
      patient_user_id: patientId,
    },
    relations: ['slot'],
    order: {
      id: 'DESC',
    },
  });
}

async getDoctorAppointments(doctorId: number) {
  return this.appointmentRepo.find({
    where: {
      doctor_user_id: doctorId,
    },
    relations: ['slot'],
    order: {
      id: 'DESC',
    },
  });
}

}
