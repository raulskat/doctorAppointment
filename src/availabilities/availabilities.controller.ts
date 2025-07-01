import { Controller, Post, Get, Param, Body, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from 'src/auth/guard/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('doctors/:id/availability')
export class AvailabilitiesController {
  constructor(private readonly availService: AvailabilitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.DOCTOR)
  async createAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateAvailabilityDto,
    @Req() req,
  ) {
    if (req.user.sub !== id) {
      throw new Error('Unauthorized: Cannot set availability for another doctor');
    }

    return this.availService.createAvailability(id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.PATIENT)
  async getDoctorAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.availService.getDoctorAvailability(id, +page, +limit);
  }
}
