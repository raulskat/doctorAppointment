import {
  IsEmail,
  IsEnum,
  IsString,
  IsDateString,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Gender } from '../../patients/entities/patient.entity';
import { UserRole } from '../../users/entities/user.entity';

export class PatientSignupDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsDateString()
  dob: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  emergency_contact?: string;

  @IsOptional()
  @IsString()
  medical_history?: string;
}
