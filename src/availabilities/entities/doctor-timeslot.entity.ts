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

  @Column({ default: 3 }) // Can be configured later per doctor or per slot
  max_bookings: number;


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
}
