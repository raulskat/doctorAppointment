// src/doctors/doctors.controller.ts
import { Controller, Get, Query, Param, Req, UseGuards, ParseIntPipe, ForbiddenException, Body, Patch, NotFoundException } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Role } from '../auth/guard/role.decorator';
import { UserRole } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';

@Controller('doctors')
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.DOCTOR)
  async getDoctorProfile(@Req() req) {
    const userId = req.user.sub;
    return this.doctorsService.getDoctorProfile(userId);
  }

  @Get()
async listDoctors(
  @Query('name') name?: string,
  @Query('specialization') specialization?: string,
  @Query('page') page = 1,
  @Query('limit') limit = 10,
) {
  return this.doctorsService.listDoctors(name, specialization, +page, +limit);
}


  @Get(':id')
  async getDoctorById(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.getDoctorById(id);
  }

@Patch(':id/schedule_Type')
@Role(UserRole.DOCTOR)
@UseGuards(JwtAuthGuard, RolesGuard)
async updateScheduleType(
  @Param('id', ParseIntPipe) id: number,
  @Body() body: { schedule_Type: 'stream' | 'wave' },
  @Req() req,
) {
  if (req.user.sub !== id) {
    throw new ForbiddenException('You can only update your own schedule type');
  }

  const result = await this.doctorRepo.update(
    { user_id: id },
    { schedule_Type: body.schedule_Type },
  );

  if (result.affected === 0) {
    throw new NotFoundException('Doctor not found or update failed');
  }

  return {
    message: `Doctor schedule type updated to '${body.schedule_Type}'`,
  };
  }
}
