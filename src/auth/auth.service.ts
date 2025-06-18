// src/auth/auth.service.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException 
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { User,UserRole } from '../users/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    private jwtService: JwtService,
    private config: ConfigService,
  ) {}



  // sign up

  async signup(dto: SignupDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already registered');

    

    const user = this.userRepo.create({
  email: dto.email,
  password: await bcrypt.hash(dto.password, 10),
  role: UserRole.DOCTOR,
});
const savedUser = await this.userRepo.save(user);

const doctor = this.doctorRepo.create({
  user: savedUser,
  first_name: dto.first_name,
  last_name: dto.last_name,
  email: dto.email, // optional, consider dropping from Doctor entity
  specialization: dto.specialization,
  experience_years: 0,
  phone_number: 'N/A',
  education: 'N/A',
  clinic_name: 'N/A',
  clinic_address: 'N/A',
  available_days: 'N/A',
  available_time_slots: 'N/A',
});
const savedDoctor = await this.doctorRepo.save(doctor);


    return {
      message: 'Doctor registered successfully',
      doctor_id: savedDoctor.doctor_id,
      user_id: savedUser.user_id,
    };
  }




// sign-in

  async signin(dto: SigninDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email },
    relations: ['doctor'], });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');

    if (user.role !== UserRole.DOCTOR)
      throw new UnauthorizedException('Access denied');

    const tokens = await this.generateTokens(user.user_id, user.email);
    
    // Optional: save hashed refresh token in DB if using token rotation
    // const hashedRt = await bcrypt.hash(tokens.refresh_token, 10);
    // await this.userRepo.update(user.user_id, { refresh_token: hashedRt });

    return {
    ...tokens,
    user: {
    user_id: user.user_id,
    email: user.email,
    doctor_id: user.doctor?.doctor_id,
    first_name: user.doctor?.first_name,
    last_name: user.doctor?.last_name,
    specialization: user.doctor?.specialization,
    experience_years: user.doctor?.experience_years,
  }
  };
  }

//  sign-out

  




  async generateTokens(userId: number, email: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.config.get('JWT_ACCESS_SECRET'),
          expiresIn: '1h',
        }
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        }
      ),
    ]);

    return { access_token, refresh_token };
  }

}