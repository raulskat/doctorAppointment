import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { AuthModule } from 'src/auth/auth.module';
@Module({
    imports: [TypeOrmModule.forFeature([Patient]),
                AuthModule,
                 ],
    exports: [TypeOrmModule],
    controllers: [PatientsController],
    providers: [PatientsService],
})
export class PatientsModule {}
