// src/auth/auth.service.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import { DoctorSignupDto } from './dto/doctor-signup.dto';
import { SigninDto } from './dto/signin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PatientSignupDto } from './dto/patient-signup.dto';
import { Gender, Patient } from '../patients/entities/patient.entity';
import { User,UserRole } from '../users/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,

    private jwtService: JwtService,
    private config: ConfigService,
  ) {}



  // sign up

  // update path if needed

async signupDoctor(dto: DoctorSignupDto) {
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
    savedDoctor,
    message: 'Doctor registered successfully',
    user_id: savedUser.user_id,
  };
}

 // if not imported yet

async signupPatient(dto: PatientSignupDto) {
  const existing = await this.userRepo.findOne({ where: { email: dto.email } });
  if (existing) throw new BadRequestException('Email already registered');

  const user = this.userRepo.create({
    email: dto.email,
    password: await bcrypt.hash(dto.password, 10),
    role: UserRole.PATIENT,
  });
  const savedUser = await this.userRepo.save(user);

  const patient = this.patientRepo.create({
    user: savedUser,
    first_name: dto.first_name,
    last_name: dto.last_name,
    phone_number: dto.phone_number,
    gender: dto.gender,
    dob: dto.dob,
    address: dto.address,
    emergency_contact: dto.emergency_contact,
    medical_history: dto.medical_history,
  });
  const savedPatient = await this.patientRepo.save(patient);

  return {
    savedPatient,
    message: 'Patient registered successfully',
    user_id: savedUser.user_id,
  };
}






// sign-in

  async signin(dto: SigninDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: ['doctor', 'patient'],
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');
    
    const userInfo = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    };
    
    if (user.role === UserRole.DOCTOR) {
          Object.assign(userInfo, {
                user_id: user.user_id,
                email: user.email,
                first_name: user.doctor?.first_name,
                last_name: user.doctor?.last_name,
                specialization: user.doctor?.specialization,
                experience_years: user.doctor?.experience_years,
      });
    } else if (user.role === UserRole.PATIENT) {
          const dob = user.patient?.dob;
          const age = dob ? this.calculateAge(dob) : null;

          Object.assign(userInfo, {
            first_name: user.patient?.first_name,
            last_name: user.patient?.last_name,
            phone_number: user.patient?.phone_number,
            gender: user.patient?.gender,
            dob: user.patient?.dob,
            age,
            address: user.patient?.address,
            emergency_contact: user.patient?.emergency_contact,
            medical_history: user.patient?.medical_history,
            email: user.patient?.user?.email, // assuming you removed `email` from the Patient entity
          });
    }
    const tokens = await this.generateTokens(user.user_id, user.email, user.role);
    
    // Optional: save hashed refresh token in DB if using token rotation
    
    await this.updateRefreshToken(user.user_id, tokens.refresh_token);
    return {
    ...tokens,
    user: userInfo
  };
  }

//  sign-out
  async signout(userId: number) {
  await this.userRepo.update(userId, {
    hashedRefreshToken: "",
  });
  return { message: 'Sign-out successful' };
  }




// 



async refreshTokens(refreshToken: string) {
  try {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });

    const user = await this.userRepo.findOne({
      where: { user_id: payload.sub },
      relations: ['doctor'], // if you need doctor data in response
    });

    if (!user || !user.hashedRefreshToken)
      throw new ForbiddenException('Access Denied');

    const isTokenMatching = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!isTokenMatching) throw new ForbiddenException('Invalid Refresh Token');

    const tokens = await this.generateTokens(user.user_id, user.email,user.role);
    await this.updateRefreshToken(user.user_id, tokens.refresh_token);

    return {
      ...tokens,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        first_name: user.doctor?.first_name,
        last_name: user.doctor?.last_name,
      }
    };
  } catch (error) {
    throw new ForbiddenException('Invalid or Expired Refresh Token');
  }
}



async updateRefreshToken(userId: number, refreshToken: string) {
  const hashed = await bcrypt.hash(refreshToken, 10);
  await this.userRepo.update(userId, {
    hashedRefreshToken: hashed,
  });
}

  async generateTokens(userId: number, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

  const [access_token, refresh_token] = await Promise.all([
    this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: '1h',
    }),
    this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    }),
  ]);

    return { access_token, refresh_token };
  }



  private calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}


}