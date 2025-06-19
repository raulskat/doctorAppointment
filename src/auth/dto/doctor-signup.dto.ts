import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class DoctorSignupDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsString()
  specialization: string;

  @IsInt()
  @Min(0)
  @Max(80)
  experience_years: number;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  education: string;

  @IsNotEmpty()
  @IsString()
  clinic_name: string;

  @IsNotEmpty()
  @IsString()
  clinic_address: string;

  @IsNotEmpty()
  @IsString()
  available_days: string;

  @IsNotEmpty()
  @IsString()
  available_time_slots: string;
}
