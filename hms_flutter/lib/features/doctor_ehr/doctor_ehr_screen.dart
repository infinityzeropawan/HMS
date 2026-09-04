import 'package:flutter/material.dart';

class DoctorEhrScreen extends StatelessWidget {
  const DoctorEhrScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Doctor Clinical Workspace')),
      body: const Center(
        child: Text(
          'EMR Consultation Chart, SOAP Notes & eRx Skeleton',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        ),
      ),
    );
  }
}
