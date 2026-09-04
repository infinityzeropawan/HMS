import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/super_admin/super_admin_screen.dart';
import '../features/hospital_admin/hospital_admin_screen.dart';
import '../features/reception/reception_screen.dart';
import '../features/doctor_ehr/doctor_ehr_screen.dart';
import '../features/billing_tpa/billing_tpa_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/reception',
  routes: [
    GoRoute(
      path: '/super-admin',
      builder: (context, state) => const SuperAdminScreen(),
    ),
    GoRoute(
      path: '/hospital-admin',
      builder: (context, state) => const HospitalAdminScreen(),
    ),
    GoRoute(
      path: '/reception',
      builder: (context, state) => const ReceptionScreen(),
    ),
    GoRoute(
      path: '/doctor-ehr',
      builder: (context, state) => const DoctorEhrScreen(),
    ),
    GoRoute(
      path: '/billing-tpa',
      builder: (context, state) => const BillingTpaScreen(),
    ),
  ],
);
