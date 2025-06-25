// src/auth/dto/signup.dto.ts
import {
  IsEmail,
  IsEnum,
  IsString,
  IsDateString,
  MinLength,
  IsOptional,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  Validate,
} from 'class-validator';
import { Gender } from '../../patients/entities/patient.entity';
import { UserRole } from '../../users/entities/user.entity';
import { RoleBasedSignupValidator } from '../validators/role-based-signup.validator';


export class SignupDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  // Common
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  // Doctor-specific (optional here, required via custom validator)
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(80)
  experience_years?: number;

  

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  clinic_name?: string;

  @IsOptional()
  @IsString()
  clinic_address?: string;

  @IsOptional()
  @IsString()
  available_days?: string;

  @IsOptional()
  @IsString()
  available_time_slots?: string;

  // Patient-specific
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  emergency_contact?: string;

  @IsOptional()
  @IsString()
  medical_history?: string;

  @Validate(RoleBasedSignupValidator)
  __roleValidator__: string;
}
