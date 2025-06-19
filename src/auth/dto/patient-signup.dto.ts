// src/auth/dto/patient-signup.dto.ts
import { IsEmail, IsEnum, IsString, IsDateString } from 'class-validator';
import { Gender } from '../../patients/entities/patient.entity';

export class PatientSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsDateString()
  dob: string;

  @IsString()
  address: string;

  @IsString()
  phone_number: string;

  @IsString()
  emergency_contact: string;

  @IsString()
  medical_history: string;
}
