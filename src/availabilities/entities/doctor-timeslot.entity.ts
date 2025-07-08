import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DoctorAvailability } from './doctor-availability.entity';

@Entity()
export class DoctorTimeSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  availability_id: number;

  @ManyToOne(() => DoctorAvailability, availability => availability.time_slots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'availability_id' })
  availability: DoctorAvailability;

  @Column({ default: 0 })
  booked_count: number;

  @Column({ type: 'int', nullable: true, default: 3 })
  patients_per_slot: number; // For wave scheduling

  @Column({ type: 'int', nullable: false, default: 30 })
  slot_duration: number; // In minutes (used for both stream & wave)



  @Column()
  user_id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ default: true })
  is_available: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'time', nullable: true })
  booking_start_time: string;
  
  @Column({ type: 'time', nullable: true })
  booking_end_time: string;
}
