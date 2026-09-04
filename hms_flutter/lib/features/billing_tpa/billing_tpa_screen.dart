import 'package:flutter/material.dart';

class BillingTpaScreen extends StatelessWidget {
  const BillingTpaScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Billing & GST Workspace')),
      body: const Center(
        child: Text(
          'Tax Invoice Generation & Payment Collection Skeleton',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        ),
      ),
    );
  }
}
