import { IsOptional, IsMilitaryTime, IsInt, Min, Max } from 'class-validator';

export class UpdateSlotDto {
  @IsOptional()
  @IsMilitaryTime()
  start_time?: string;

  @IsOptional()
  @IsMilitaryTime()
  end_time?: string;

  @IsOptional()
  @IsMilitaryTime()
  booking_start_time?: string;

  @IsOptional()
  @IsMilitaryTime()
  booking_end_time?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(60)
  slot_duration?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  patients_per_slot?: number;
}
