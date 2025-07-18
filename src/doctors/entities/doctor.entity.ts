import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { DoctorAvailability } from 'src/availabilities/entities/doctor-availability.entity';


@Entity()
export class Doctor {
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => User, user => user.doctor, { eager: true, cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ['stream', 'wave'], default: 'stream' })
  schedule_Type: 'stream' | 'wave';


  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  phone_number: string;

  @Column()
  specialization: string;

  @Column('int')
  experience_years: number;

  @Column('text')
  education: string;

  @Column()
  clinic_name: string;

  @Column('text')
  clinic_address: string;

  @Column()
  available_days: string;

  @Column()
  available_time_slots: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => DoctorAvailability, availability => availability.doctor)
  availabilities: DoctorAvailability[];

  
}