import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository, ILike } from 'typeorm';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  private mapDoctor(doctor: Doctor) {
    return {
      user_id: doctor.user_id,
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      specialization: doctor.specialization,
      experience_years: doctor.experience_years,
      clinic_name: doctor.clinic_name,
      clinic_address: doctor.clinic_address,
      available_days: doctor.available_days,
      available_time_slots: doctor.available_time_slots,
      email: doctor.user.email,
    };
  }

  async getDoctorProfile(userId: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { user_id: userId } },
      relations: ['user'],
    });

    if (!doctor) throw new NotFoundException('Doctor profile not found');

    return this.mapDoctor(doctor);
  }

  async listDoctors(name?: string, specialization?: string, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const useTrigram = process.env.USE_TRIGRAM === 'true';

  const query = this.doctorRepo.createQueryBuilder('doctor')
    .leftJoinAndSelect('doctor.user', 'user')
    .take(limit)
    .skip(offset);

  if (name) {
    if (useTrigram) {
      query.andWhere(
        `(doctor.first_name % :name OR doctor.last_name % :name)`,
        { name }
      );
    } else {
      query.andWhere(
        `(doctor.first_name ILIKE :likeName OR doctor.last_name ILIKE :likeName)`,
        { likeName: `%${name}%` }
      );
    }
  }

  if (specialization) {
    if (useTrigram) {
      query.andWhere(`doctor.specialization % :specialization`, { specialization });
    } else {
      query.andWhere(`doctor.specialization ILIKE :likeSpec`, { likeSpec: `%${specialization}%` });
    }
  }

  const [doctors, total] = await query.getManyAndCount();

  return {
    total,
    page,
    limit,
    results: doctors.map((doc) => this.mapDoctor(doc)),
  };
}

  async getDoctorById(user_id: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { user_id },
      relations: ['user'],
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.mapDoctor(doctor);
  }
}
