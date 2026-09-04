class EncounterModel {
  final String id;
  final String patientId;
  final String doctorId;
  final String? chiefComplaint;
  final String status;

  EncounterModel({
    required this.id,
    required this.patientId,
    required this.doctorId,
    this.chiefComplaint,
    required this.status,
  });

  factory EncounterModel.fromJson(Map<String, dynamic> json) {
    return EncounterModel(
      id: json['id'] ?? '',
      patientId: json['patientId'] ?? '',
      doctorId: json['doctorId'] ?? '',
      chiefComplaint: json['chiefComplaint'],
      status: json['encounterStatus'] ?? 'open',
    );
  }
}
