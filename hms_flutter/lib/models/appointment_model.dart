class AppointmentModel {
  final String id;
  final String patientId;
  final String doctorId;
  final String appointmentDate;
  final String status;

  AppointmentModel({
    required this.id,
    required this.patientId,
    required this.doctorId,
    required this.appointmentDate,
    required this.status,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: json['id'] ?? '',
      patientId: json['patientId'] ?? '',
      doctorId: json['doctorId'] ?? '',
      appointmentDate: json['appointmentDate'] ?? '',
      status: json['status'] ?? 'booked',
    );
  }
}
