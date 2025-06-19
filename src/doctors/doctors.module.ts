import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { AuthModule } from 'src/auth/auth.module';
@Module({
    imports: [TypeOrmModule.forFeature([Doctor]),
              AuthModule,],
    exports: [TypeOrmModule],
    controllers: [DoctorsController],
    providers: [DoctorsService],
})
export class DoctorsModule {}
