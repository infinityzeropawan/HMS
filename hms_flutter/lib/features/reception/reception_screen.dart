import 'package:flutter/material.dart';

class ReceptionScreen extends StatelessWidget {
  const ReceptionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reception & OPD Queue')),
      body: const Center(
        child: Text(
          'Patient UHID Registration & Appointment Token Queue Skeleton',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        ),
      ),
    );
  }
}
