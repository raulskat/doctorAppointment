// src/auth/auth.service.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PatientSignupDto } from './dto/patient-signup.dto';
import { Gender, Patient } from '../patients/entities/patient.entity';
import { Provider, User,UserRole } from '../users/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { google } from 'googleapis';
import {
  GoogleCallbackResponse,
  ExistingUserResponse,
  NewUserResponse,
} from './types/auth.types';

@Injectable()
export class AuthService {
  private oauth2Client;
  
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,

    private jwtService: JwtService,
    private config: ConfigService,
  ) {
     {
    this.oauth2Client = new google.auth.OAuth2(
      this.config.get('GOOGLE_CLIENT_ID'),
      this.config.get('GOOGLE_CLIENT_SECRET'),
      this.config.get('GOOGLE_REDIRECT_URI'),
    );
  }
  }



  // sign up

  // update path if needed
  async getGoogleAuthURL(role: string): Promise<string> {
  const url = this.oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    state: role,
  });
  return url;
}

async handleGoogleCallback(code: string, role: string): Promise<GoogleCallbackResponse> {
  // Get tokens from Google
  const { tokens: googleTokens } = await this.oauth2Client.getToken(code);
  this.oauth2Client.setCredentials(googleTokens);

  // Get user profile from Google
  const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
  const { data: profile } = await oauth2.userinfo.get();

  if (!profile.email) {
    throw new BadRequestException('Google account does not have a verified email.');
  }

  // Check for existing user in DB
  const existingUser = await this.userRepo.findOne({
    where: { email: profile.email },
    relations: ['doctor', 'patient'],
  });

  // If registered with local credentials, block login
  if (existingUser && existingUser.provider === 'local') {
    throw new BadRequestException(
      'This account was registered using email/password. Please login using email.',
    );
  }

  if (existingUser) {
    const jwtTokens = await this.generateTokens(
      existingUser.user_id,
      existingUser.email,
      existingUser.role,
    );

    await this.updateRefreshToken(existingUser.user_id, jwtTokens.refresh_token);

    return {
      status: 'existing',
      ...jwtTokens,
      user: {
        user_id: existingUser.user_id,
        email: existingUser.email,
        role: existingUser.role,
      },
    };
  }

  // Register new user
  const user = this.userRepo.create({
  email: profile.email,
  password: null,
  provider: Provider.GOOGLE, // Use the correct enum value
  role: role === 'doctor' ? UserRole.DOCTOR : UserRole.PATIENT,
});
const savedUser = await this.userRepo.save(user);

 const tempToken = await this.jwtService.signAsync(
  { user_id: savedUser.user_id, email: savedUser.email, role: savedUser.role },
  { secret: this.config.get('JWT_ACCESS_SECRET'), expiresIn: '15m' },
);
return {
  status: 'new',
  message: 'Google login successful. Please complete profile.',
  temp_token: tempToken,
  user: {
    user_id: savedUser.user_id,
    email: savedUser.email,
    role: savedUser.role,
  },
};

  // const jwtTokens = await this.generateTokens(savedUser.user_id, savedUser.email, savedUser.role);
  // await this.updateRefreshToken(savedUser.user_id, jwtTokens.refresh_token);

  // return {
  //   ...jwtTokens,
  //   user: {
  //     user_id: savedUser.user_id,
  //     email: savedUser.email,
  //     role: savedUser.role,
  //   },
  // };
}

// auth.service.ts
async completeGoogleSignup(
  dto: SignupDto,
  userPayload: { user_id: number; email: string; role: UserRole },
) {
  const user = await this.userRepo.findOne({
    where: { user_id: userPayload.user_id },
    relations: ['doctor', 'patient'],
  });

  if (!user) throw new BadRequestException('User not found');

  if (user.role === UserRole.DOCTOR) {
    if (user.doctor) {
      throw new BadRequestException('Doctor profile already exists');
    }

    const doctor = this.doctorRepo.create({
      user,
      first_name: (dto as SignupDto).first_name,
      last_name: (dto as SignupDto).last_name,
      specialization: (dto as SignupDto).specialization,
      experience_years: (dto as SignupDto).experience_years,
      phone_number: (dto as SignupDto).phone_number,
      education: (dto as SignupDto).education,
      clinic_name: (dto as SignupDto).clinic_name,
      clinic_address: (dto as SignupDto).clinic_address,
      available_days: (dto as SignupDto).available_days,
      available_time_slots: (dto as SignupDto).available_time_slots,
    });

    await this.doctorRepo.save(doctor);
    return { message: 'Doctor profile completed successfully' };
  }

  if (user.role === UserRole.PATIENT) {
    if (user.patient) {
      throw new BadRequestException('Patient profile already exists');
    }

    const patient = this.patientRepo.create({
      user,
      first_name: (dto as PatientSignupDto).first_name,
      last_name: (dto as PatientSignupDto).last_name,
      phone_number: (dto as PatientSignupDto).phone_number,
      gender: (dto as PatientSignupDto).gender,
      dob: (dto as PatientSignupDto).dob,
      address: (dto as PatientSignupDto).address,
      emergency_contact: (dto as PatientSignupDto).emergency_contact,
      medical_history: (dto as PatientSignupDto).medical_history,
    });

    await this.patientRepo.save(patient);
    return { message: 'Patient profile completed successfully' };
  }

  throw new BadRequestException('Invalid user role');
}

async signup(dto: SignupDto) {
  const existing = await this.userRepo.findOne({ where: { email: dto.email } });
  if (existing) throw new BadRequestException('Email already registered');

  const user = this.userRepo.create({
    email: dto.email,
    password: await bcrypt.hash(dto.password, 10),
    role: dto.role,
  });
  const savedUser = await this.userRepo.save(user);

  if (dto.role === UserRole.DOCTOR) {
    const doctor = this.doctorRepo.create({
      user: savedUser,
      first_name: dto.first_name,
      last_name: dto.last_name,
      specialization: dto.specialization,
      experience_years: dto.experience_years,
      phone_number: dto.phone_number,
      education: dto.education,
      clinic_name: dto.clinic_name,
      clinic_address: dto.clinic_address,
      available_days: dto.available_days,
      available_time_slots: dto.available_time_slots,
    });
    const savedDoctor = await this.doctorRepo.save(doctor);

    return {
      savedDoctor,
      message: 'Doctor registered successfully',
      user_id: savedUser.user_id,
    };
  }

  if (dto.role === UserRole.PATIENT) {
    const patient = this.patientRepo.create({
      user: savedUser,
      first_name: dto.first_name,
      last_name: dto.last_name,
      phone_number: dto.phone_number,
      gender: dto.gender,
      dob: dto.dob,
      address: dto.address,
      emergency_contact: dto.emergency_contact,
      medical_history: dto.medical_history ?? "",
    });
    const savedPatient = await this.patientRepo.save(patient);

    return {
      savedPatient,
      message: 'Patient registered successfully',
      user_id: savedUser.user_id,
    };
  }

  throw new BadRequestException('Invalid role');
}







// sign-in

  async signin(dto: SigninDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: ['doctor', 'patient'],
    });
    

    if (!user) throw new UnauthorizedException('Invalid credentials');
    // 🛡️ Block OAuth users from using local signin
  if (user.provider !== 'local' || !user.password) {
    throw new UnauthorizedException('Please login using Google OAuth.');
  }


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
    hashedRefreshToken: null,
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