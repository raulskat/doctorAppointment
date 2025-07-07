// appointments/entities/appointment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { DoctorTimeSlot } from 'src/availabilities/entities/doctor-timeslot.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctor_user_id: number;
  
  @Column()
  patient_user_id: number;
  
  @Column()
  slot_id: number;

  @ManyToOne(() => DoctorTimeSlot)
  @JoinColumn({ name: 'slot_id' })
  slot: DoctorTimeSlot;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp',nullable:true })
  reporting_time: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  scheduled_on: Date;

}
