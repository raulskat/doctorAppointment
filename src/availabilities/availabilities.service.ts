import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { DoctorTimeSlot } from './entities/doctor-timeslot.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import * as dayjs from 'dayjs';
import * as isSameOrBeforePlugin from 'dayjs/plugin/isSameOrBefore';
dayjs.extend((isSameOrBeforePlugin as any).default || isSameOrBeforePlugin);


@Injectable()
export class AvailabilitiesService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private availabilityRepo: Repository<DoctorAvailability>,
    @InjectRepository(DoctorTimeSlot)
    private slotRepo: Repository<DoctorTimeSlot>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async createAvailability(user_id: number, dto: CreateAvailabilityDto) {
    const doctor = await this.doctorRepo.findOne({ where: { user_id: user_id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const { date, session, start_time, end_time } = dto;

    // 1. Date should not be in past
    if (dayjs(date).isBefore(dayjs().startOf('day'))) {
      throw new BadRequestException('Date cannot be in the past');
    }

    // ✅ 2. Check if end_time is after start_time
  if (dayjs(`${date}T${end_time}`).isSameOrBefore(dayjs(`${date}T${start_time}`))) {
    throw new BadRequestException('End time must be after start time');
  }

  // 3. Check for overlapping availability time ranges
  const overlapping = await this.availabilityRepo
    .createQueryBuilder('availability')
    .where('availability.user_id = :user_id', { user_id })
    .andWhere('availability.date = :date', { date })
    .andWhere('availability.session = :session', { session })
    .andWhere('(:start_time < availability.end_time AND :end_time > availability.start_time)', {
      start_time,
      end_time,
    })
    .getOne();

  if (overlapping) {
    throw new BadRequestException('Availability overlaps with an existing one in this session');
  }
  

    // 4. Save availability
    const availability = this.availabilityRepo.create({
      user_id,
      date,
      session,
      start_time,
      end_time,
    });
    const savedAvailability = await this.availabilityRepo.save(availability);

    // 5. Generate slots 
    const { slot_duration=30, patients_per_slot =1} = dto;

    if (slot_duration % patients_per_slot !== 0) {
  throw new BadRequestException('Slot duration must be divisible by number of patients per slot');
}

    const slots = this.generateSlots(
      date,
      start_time,
      end_time,
      slot_duration,
      patients_per_slot,
      savedAvailability.id,
      user_id,
    );

    await this.slotRepo.save(slots);
    return { message: 'Availability and slots created', slots };
  }
  

  private generateSlots(
    date: string,
    startTime: string,
    endTime: string,
    durationMinutes: number,
    patientsPerSlot: number,
    availabilityId: number,
    user_id: number,
  ): DoctorTimeSlot[] {
    const start = dayjs(`${date}T${startTime}`);
    const end = dayjs(`${date}T${endTime}`);
    const slots: DoctorTimeSlot[] = [];

    for (let current = start; current.isBefore(end); current = current.add(durationMinutes, 'minute')) {
      const next = current.add(durationMinutes, 'minute');
      if (next.isAfter(end)) break;

      slots.push(
        this.slotRepo.create({
          availability_id: availabilityId,
          user_id,
          date,
          start_time: current.format('HH:mm'),
          end_time: next.format('HH:mm'),
          is_available: true,
          slot_duration: durationMinutes,
          patients_per_slot: patientsPerSlot,
          booked_count: 0,
        }),
      );
    }

    return slots;
  }

  async getDoctorAvailability(user_id: number, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [slots, total] = await this.slotRepo.findAndCount({
      where: {
        user_id,
        date: MoreThanOrEqual(dayjs().format('YYYY-MM-DD')),
      },
      order: { date: 'ASC', start_time: 'ASC' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      page,
      limit,
      results: slots,
    };
  }
}
