import {
  IsDateString,
  IsEnum,
  IsString,
  IsMilitaryTime,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateAvailabilityDto {
  @IsDateString()
  date: string;

  @IsEnum(['morning', 'evening'], { message: 'Session must be morning or evening' })
  session: 'morning' | 'evening';

  @IsMilitaryTime()
  start_time: string;

  @IsMilitaryTime()
  end_time: string;

  @IsInt()
  @Min(5)
  @Max(60)
  slot_duration: number; // e.g., 10, 15, 20, 30 (in minutes)

  @IsInt()
  @Min(1)
  @Max(10)
  patients_per_slot: number; // e.g., 1 to 10 patients per slot

  @IsMilitaryTime()
  @IsOptional()
  booking_start_time?: string;

  @IsMilitaryTime()
  @IsOptional()
  booking_end_time?: string;
}
