class PatientModel {
  final String id;
  final String tenantId;
  final String hospitalId;
  final String uhid;
  final String firstName;
  final String? lastName;
  final String? gender;
  final String? mobile;
  final String? abhaNumber;

  PatientModel({
    required this.id,
    required this.tenantId,
    required this.hospitalId,
    required this.uhid,
    required this.firstName,
    this.lastName,
    this.gender,
    this.mobile,
    this.abhaNumber,
  });

  factory PatientModel.fromJson(Map<String, dynamic> json) {
    return PatientModel(
      id: json['id'] ?? '',
      tenantId: json['tenant_id'] ?? json['tenantId'] ?? '',
      hospitalId: json['hospital_id'] ?? json['hospitalId'] ?? '',
      uhid: json['uhid'] ?? '',
      firstName: json['first_name'] ?? json['firstName'] ?? '',
      lastName: json['last_name'] ?? json['lastName'],
      gender: json['gender'],
      mobile: json['mobile'],
      abhaNumber: json['abha_number'] ?? json['abhaNumber'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'tenant_id': tenantId,
        'hospital_id': hospitalId,
        'uhid': uhid,
        'first_name': firstName,
        'last_name': lastName,
        'gender': gender,
        'mobile': mobile,
        'abha_number': abhaNumber,
      };
}
