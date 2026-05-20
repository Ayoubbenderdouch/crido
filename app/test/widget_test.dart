import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:crido/core/theme/app_colors.dart';

void main() {
  test('Crido brand teal matches the design system', () {
    expect(AppColors.cridoTeal, const Color(0xFF0F6E56));
  });
}
