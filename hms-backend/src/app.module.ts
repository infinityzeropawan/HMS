import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { HospitalsModule } from './modules/hospitals/hospitals.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { EncountersModule } from './modules/encounters/encounters.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { InvoicesModule } from './modules/invoices/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    HospitalsModule,
    UsersModule,
    PatientsModule,
    AppointmentsModule,
    EncountersModule,
    PrescriptionsModule,
    InvoicesModule,
  ],
})
export class AppModule {}
