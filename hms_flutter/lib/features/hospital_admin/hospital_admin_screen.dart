import 'package:flutter/material.dart';

class HospitalAdminScreen extends StatelessWidget {
  const HospitalAdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hospital Admin Workspace')),
      body: const Center(
        child: Text(
          'Hospital Infrastructure & User Management Skeleton',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        ),
      ),
    );
  }
}
