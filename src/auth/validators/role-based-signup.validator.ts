// src/auth/validators/role-based-signup.validator.ts
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { SignupDto } from '../dto/signup.dto';
import { UserRole } from '../../users/entities/user.entity';

@ValidatorConstraint({ name: 'RoleBasedSignupValidator', async: false })
export class RoleBasedSignupValidator implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const dto = args.object as SignupDto;

    if (dto.role === UserRole.DOCTOR) {
      return !!(
        dto.specialization &&
        dto.experience_years !== undefined &&
        dto.phone_number &&
        dto.education &&
        dto.clinic_name &&
        dto.clinic_address &&
        dto.available_days &&
        dto.available_time_slots
      );
    }

    if (dto.role === UserRole.PATIENT) {
      return !!(
        dto.gender &&
        dto.dob &&
        dto.phone_number &&
        dto.first_name &&
        dto.last_name &&
        dto.emergency_contact
      );
    }

    return false; // fallback for invalid roles
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as SignupDto;

    if (dto.role === UserRole.DOCTOR) {
      return 'Missing one or more required fields for DOCTOR role.';
    }

    if (dto.role === UserRole.PATIENT) {
      return 'Missing one or more required fields for PATIENT role.';
    }

    return 'Invalid or unsupported role.';
  }
}
