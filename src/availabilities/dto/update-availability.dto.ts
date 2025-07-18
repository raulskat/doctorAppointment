// availabilities/dto/update-availability.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAvailabilityDto } from './create-availability.dto';

export class UpdateAvailabilityDto extends PartialType(CreateAvailabilityDto) {}
