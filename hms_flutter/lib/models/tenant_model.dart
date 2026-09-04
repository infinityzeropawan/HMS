class TenantModel {
  final String id;
  final String name;
  final String subdomain;
  final String status;

  TenantModel({
    required this.id,
    required this.name,
    required this.subdomain,
    required this.status,
  });

  factory TenantModel.fromJson(Map<String, dynamic> json) {
    return TenantModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      subdomain: json['subdomain'] ?? '',
      status: json['status'] ?? 'active',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'subdomain': subdomain,
        'status': status,
      };
}
