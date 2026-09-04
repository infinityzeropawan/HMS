import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primaryTeal = Color(0xFF0D9488);
  static const Color darkSlate = Color(0xFF0F172A);
  static const Color softCyan = Color(0xFFE0F2FE);
  static const Color alertCrimson = Color(0xFFE11D48);
  static const Color successEmerald = Color(0xFF059669);
  static const Color backgroundGrey = Color(0xFFF8FAFC);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryTeal,
        primary: primaryTeal,
        secondary: darkSlate,
        background: backgroundGrey,
        error: alertCrimson,
      ),
      scaffoldBackgroundColor: backgroundGrey,
      textTheme: GoogleFonts.interTextTheme(),
      appBarTheme: AppBarTheme(
        backgroundColor: darkSlate,
        foregroundColor: Colors.white,
        elevation: 0,
        titleTextStyle: GoogleFonts.inter(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}
