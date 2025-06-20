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
import { TimeSlot } from 'src/timeslots/entities/timeslot.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Entity()
export class Doctor {
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => User, user => user.doctor, { eager: true, cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

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

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => TimeSlot, timeslot => timeslot.doctor)
  timeslots: TimeSlot[];
}