import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
export enum Provider {
  LOCAL = 'local',
  GOOGLE = 'google',
}


export enum UserRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  ADMIN = 'admin',
}
@Entity()
export class User {
  @Column({ type: 'enum', enum: Provider, default: Provider.LOCAL })
  provider: Provider;

  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
password: string | null;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ default: () => 'NOW()', nullable: false })
  last_login: Date;

  @OneToOne(() => Doctor, doctor => doctor.user, { nullable: true })
  doctor: Doctor;

  @OneToOne(() => Patient, patient => patient.user, { nullable: true })
  patient: Patient;

  @Column({ type: 'text', nullable: true })
  hashedRefreshToken?: string | null;
}

