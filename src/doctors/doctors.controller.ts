// src/doctors/doctors.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Role } from '../auth/guard/role.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.DOCTOR)
  async getDoctorProfile(@Req() req) {
    const userId = req.user.sub;
    return this.doctorsService.getDoctorProfile(userId);
  }
}
