import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { TimeSlot } from 'src/timeslots/entities/timeslot.entity';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  RESCHEDULED = 'rescheduled',
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  appointment_id: number;

  @ManyToOne(() => Doctor, doctor => doctor.appointments, { eager: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Patient, patient => patient.appointments, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'timestamp' })
  scheduled_on: Date;

 @ManyToOne(() => TimeSlot, { eager: true })
 @JoinColumn({ name: 'slot_id' }) 
 time_slot: TimeSlot;
 

  @Column({ type: 'enum', enum: AppointmentStatus })
  appointment_status: AppointmentStatus;

  @Column('text')
  reason: string;

  @Column('text')
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}