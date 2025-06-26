import { IsDateString, IsEnum, IsString, IsMilitaryTime } from 'class-validator';

export class CreateAvailabilityDto {
  @IsDateString()
  date: string;

  @IsEnum(['morning', 'evening'], { message: 'Session must be morning or evening' })
  session: 'morning' | 'evening';

  @IsMilitaryTime()
  start_time: string;

  @IsMilitaryTime()
  end_time: string;

  // optional buffer between slots or slot duration could be added here
}
