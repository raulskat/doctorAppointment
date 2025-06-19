// src/patients/patients.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Role } from '../auth/guard/role.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.PATIENT)
  async getProfile(@Req() req) {
    return this.patientsService.getProfile(req.user.sub);
  }
}
