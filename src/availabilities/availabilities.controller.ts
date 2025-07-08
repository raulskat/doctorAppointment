import { Controller, Post, Get, Param, Body, Query, UseGuards, Req, ParseIntPipe, Delete, Patch } from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from 'src/auth/guard/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { UpdateSlotDto } from './dto/update-slot.dto';

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

  @Delete('slots/:slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.DOCTOR)
  async deleteSlot(@Param('slotId', ParseIntPipe) slotId: number, @Req() req) {
    return this.availService.deleteSlot(slotId, req.user.sub);
  }

  

  @Patch('slots/:slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.DOCTOR)
  async editSlot(
    @Param('slotId', ParseIntPipe) slotId: number,
    @Body() dto: UpdateSlotDto,
    @Req() req,
  ) {
    return this.availService.editSlot(slotId, req.user.sub, dto);
  }

}
