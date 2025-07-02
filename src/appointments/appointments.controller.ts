// appointments.controller.ts
import {
  Controller,
  Post,
  Req,
  Body,
  UseGuards,
  Get,
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
  async getPatientAppointments(@Req() req) {
    return this.appointmentService.getPatientAppointments(req.user.sub);
  }

  @Get('view/doctor')
  @Role(UserRole.DOCTOR)
  async getDoctorAppointments(@Req() req) {
    return this.appointmentService.getDoctorAppointments(req.user.sub);
  }
}
