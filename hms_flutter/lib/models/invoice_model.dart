class InvoiceModel {
  final String id;
  final String invoiceNumber;
  final double netAmount;
  final String paymentStatus;

  InvoiceModel({
    required this.id,
    required this.invoiceNumber,
    required this.netAmount,
    required this.paymentStatus,
  });

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    return InvoiceModel(
      id: json['id'] ?? '',
      invoiceNumber: json['invoiceNumber'] ?? '',
      netAmount: (json['netAmount'] ?? 0).toDouble(),
      paymentStatus: json['paymentStatus'] ?? 'unpaid',
    );
  }
}
