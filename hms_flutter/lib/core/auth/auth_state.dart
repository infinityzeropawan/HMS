import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthState {
  final bool isAuthenticated;
  final String? token;
  final String? tenantId;
  final String? hospitalId;
  final String? userRole;

  const AuthState({
    this.isAuthenticated = false,
    this.token,
    this.tenantId,
    this.hospitalId,
    this.userRole,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    String? token,
    String? tenantId,
    String? hospitalId,
    String? userRole,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      token: token ?? this.token,
      tenantId: tenantId ?? this.tenantId,
      hospitalId: hospitalId ?? this.hospitalId,
      userRole: userRole ?? this.userRole,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final _storage = const FlutterSecureStorage();

  AuthNotifier() : super(const AuthState()) {
    _loadSavedState();
  }

  Future<void> _loadSavedState() async {
    final token = await _storage.read(key: 'jwt_token');
    final tenantId = await _storage.read(key: 'tenant_id');
    final hospitalId = await _storage.read(key: 'hospital_id');
    final userRole = await _storage.read(key: 'user_role');

    if (token != null) {
      state = AuthState(
        isAuthenticated: true,
        token: token,
        tenantId: tenantId,
        hospitalId: hospitalId,
        userRole: userRole,
      );
    }
  }

  Future<void> login(String token, String tenantId, String hospitalId, String userRole) async {
    await _storage.write(key: 'jwt_token', value: token);
    await _storage.write(key: 'tenant_id', value: tenantId);
    await _storage.write(key: 'hospital_id', value: hospitalId);
    await _storage.write(key: 'user_role', value: userRole);

    state = AuthState(
      isAuthenticated: true,
      token: token,
      tenantId: tenantId,
      hospitalId: hospitalId,
      userRole: userRole,
    );
  }

  Future<void> logout() async {
    await _storage.deleteAll();
    state = const AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
