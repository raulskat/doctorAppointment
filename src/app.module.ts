import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeorm.config';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientsModule } from './patients/patients.module';
import { AuthModule } from './auth/auth.module';
import { AvailabilitiesModule } from './availabilities/availabilities.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            TypeOrmModule.forRoot(typeOrmConfig),
            HelloWorldModule,
            UsersModule,
            DoctorsModule,
            PatientsModule,
            AuthModule,
            AvailabilitiesModule,
            AppointmentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
