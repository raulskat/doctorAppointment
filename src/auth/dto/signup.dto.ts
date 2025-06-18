// src/auth/dto/signup.dto.ts
import { IsEmail, IsNotEmpty, MinLength,Min, Max, IsInt } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

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
