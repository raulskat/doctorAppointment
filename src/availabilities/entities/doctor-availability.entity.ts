import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { DoctorTimeSlot } from './doctor-timeslot.entity';

@Entity()
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => Doctor, doctor => doctor.availabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  doctor: Doctor;

  @Column({ type: 'date' })
  date: string;

  @Column()
  session: 'morning' | 'evening';

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @OneToMany(() => DoctorTimeSlot, slot => slot.availability, { cascade: true })
  time_slots: DoctorTimeSlot[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
