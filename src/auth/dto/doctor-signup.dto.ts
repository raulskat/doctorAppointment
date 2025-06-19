// src/auth/dto/signup.dto.ts
import { IsEmail, IsNotEmpty, MinLength,Min, Max, IsInt,IsEnum } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class DoctorSignupDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsNotEmpty()
  specialization: string;
  @IsInt()
  @Min(0)
  @Max(80)
  experience_years: number;
}
