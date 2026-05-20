import 'package:intl/intl.dart';

// Algerian/Maghrebi Arabic month names (see docs/ALGERIA_CONTEXT.md).
const _arMonths = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

/// Amount in Algerian Dinar — Western digits, `دج` suffix.
String formatDzd(num amount) {
  final n = NumberFormat.decimalPattern('en_US').format(amount.round());
  return '$n دج';
}

String formatNumber(num value) =>
    NumberFormat.decimalPattern('en_US').format(value);

/// `15 جانفي 2026`
String formatDate(DateTime d) => '${d.day} ${_arMonths[d.month - 1]} ${d.year}';

/// `15/01/2026`
String formatDateShort(DateTime d) =>
    '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
