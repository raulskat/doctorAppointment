// appointments.controller.ts
import {
  Controller,
  Post,
  Req,
  Body,
  UseGuards,
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
}
