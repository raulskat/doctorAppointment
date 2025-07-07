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

  const slotStartDateTime = dayjs(`${slot.date} ${slot.start_time}`);

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
