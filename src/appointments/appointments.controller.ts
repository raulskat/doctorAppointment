// appointments.controller.ts
import {
  Controller,
  Post,
  Req,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from 'src/auth/guard/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentsService) {}

  @Post()
  @Role(UserRole.PATIENT)
  async bookAppointment(@Req() req, @Body() dto: BookAppointmentDto) {
    const patientId = req.user.sub;
    return this.appointmentService.bookAppointment(dto, patientId);
  }

  @Get('view/patient')
  @Role(UserRole.PATIENT)
  async getPatientAppointments(@Req() req, @Query('type') type: 'upcoming' | 'past' | 'cancelled') {
    return this.appointmentService.getFilteredPatientAppointments(req.user.sub, type);
  }

  @Get('view/doctor')
  @Role(UserRole.DOCTOR)
  async getDoctorAppointments(@Req() req) {
    return this.appointmentService.getDoctorAppointments(req.user.sub);
  }
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @Role(UserRole.DOCTOR, UserRole.PATIENT)
  async cancelAppointment(@Req() req, @Param('id') id: number) {
    return this.appointmentService.cancelAppointment(req.user.sub, id);
  }

}
