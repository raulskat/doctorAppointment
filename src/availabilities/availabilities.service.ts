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

    // 2. Check if availability already exists for same date+session
    const exists = await this.availabilityRepo.findOne({
      where: { user_id: user_id, date, session },
    });
    if (exists) throw new BadRequestException('Availability already exists for this session');

    // 3. Save availability
    const availability = this.availabilityRepo.create({
      user_id,
      date,
      session,
      start_time,
      end_time,
    });
    const savedAvailability = await this.availabilityRepo.save(availability);

    // 4. Generate slots (default 30 min)
    const slotDuration = 30;
    const slots = this.generateSlots(
      date,
      start_time,
      end_time,
      slotDuration,
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
        is_available: true,
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
