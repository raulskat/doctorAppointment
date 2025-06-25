// src/patients/patients.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async getProfile(userId: number) {
    const patient = await this.patientRepo.findOne({
      where: { user: { user_id: userId } },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    return {
      first_name: patient.first_name,
      last_name: patient.last_name,
      phone_number: patient.phone_number,
      gender: patient.gender,
      dob: patient.dob,
      age: this.calculateAge(patient.dob),
      address: patient.address,
      emergency_contact: patient.emergency_contact,
      medical_history: patient.medical_history,
      email: patient.user.email,
    };
  }

  private calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
