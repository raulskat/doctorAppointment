import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { AuthModule } from 'src/auth/auth.module';
import { AvailabilitiesModule } from 'src/availabilities/availabilities.module';
@Module({
    imports: [  TypeOrmModule.forFeature([Doctor]),
                AvailabilitiesModule,
                AuthModule,],
    exports: [TypeOrmModule],
    controllers: [DoctorsController],
    providers: [DoctorsService],
})
export class DoctorsModule {}
