import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class HeaderInterceptor extends Interceptor {
  final _storage = const FlutterSecureStorage();

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _storage.read(key: 'jwt_token');
    final tenantId = await _storage.read(key: 'tenant_id') ?? '8f3b2a1c-9d0e-4f5a-8b2c-1d3e5f7a9b0c';
    final hospitalId = await _storage.read(key: 'hospital_id') ?? '22334455-6677-8899-0011-bbccddeeff00';

    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    options.headers['X-Tenant-ID'] = tenantId;
    options.headers['X-Hospital-ID'] = hospitalId;
    options.headers['Content-Type'] = 'application/json';
    options.headers['Accept'] = 'application/json';

    return super.onRequest(options, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Handle unauthorized session / token expiration redirect stub
    }
    return super.onError(err, handler);
  }
}
