import 'package:flutter/material.dart';

import 'models.dart';

List<Installment> _schedule({
  required int count,
  required int paid,
  required int monthly,
  required DateTime activated,
  bool lastIsLate = false,
}) {
  return List.generate(count, (i) {
    final n = i + 1;
    final due = DateTime(activated.year, activated.month + n, activated.day);
    String status;
    if (n <= paid) {
      status = 'paid';
    } else if (n == paid + 1) {
      status = lastIsLate ? 'late' : 'due';
    } else {
      status = 'scheduled';
    }
    return Installment(number: n, dueDate: due, amountDzd: monthly, status: status);
  });
}

/// Static seed data for the Crido client app prototype.
class Mock {
  Mock._();

  static const client = ClientProfile(
    name: 'أيوب قويدري',
    phone: '+213551203847',
    commune: 'أدرار',
    kycStatus: 'approved',
  );

  static const credit = CreditInfo(score: 690, tier: 'B', limitDzd: 280000, usedDzd: 230000);

  static const categories = <Category>[
    Category(id: 'phones', nameAr: 'هواتف ذكية', icon: Icons.smartphone_outlined),
    Category(id: 'tv', nameAr: 'تلفزيونات', icon: Icons.tv_outlined),
    Category(id: 'computers', nameAr: 'حواسيب', icon: Icons.laptop_mac_outlined),
    Category(id: 'furniture', nameAr: 'أثاث', icon: Icons.weekend_outlined),
    Category(id: 'appliances', nameAr: 'أجهزة منزلية', icon: Icons.kitchen_outlined),
    Category(id: 'fashion', nameAr: 'موضة', icon: Icons.checkroom_outlined),
  ];

  static const plans = <FinancingPlan>[
    FinancingPlan(months: 4, marginPct: 5),
    FinancingPlan(months: 6, marginPct: 8),
    FinancingPlan(months: 12, marginPct: 15),
  ];

  static const merchants = <Merchant>[
    Merchant(id: 'm1', slug: 'tahar-phones', nameAr: 'طاهر فون', category: 'هواتف ذكية', commune: 'أدرار', rating: 4.8, productCount: 24, isPartner: true),
    Merchant(id: 'm2', slug: 'electro-adrar', nameAr: 'إلكترو أدرار', category: 'أجهزة منزلية', commune: 'أدرار', rating: 4.6, productCount: 31, isPartner: true),
    Merchant(id: 'm3', slug: 'athath-touat', nameAr: 'أثاث توات', category: 'أثاث', commune: 'أدرار', rating: 4.7, productCount: 18, isPartner: true),
    Merchant(id: 'm4', slug: 'tamest-electronic', nameAr: 'تامست إلكترونيك', category: 'تلفزيونات', commune: 'تامست', rating: 4.5, productCount: 12, isPartner: true),
    Merchant(id: 'm5', slug: 'noor-reggane', nameAr: 'محل النور', category: 'أجهزة منزلية', commune: 'رقان', rating: 4.4, productCount: 9, isPartner: true),
    Merchant(id: 'm6', slug: 'pc-adrar', nameAr: 'عالم الحاسوب', category: 'حواسيب', commune: 'أدرار', rating: 4.9, productCount: 15, isPartner: true),
  ];

  static const _tintTeal = Color(0xFFE1F5EE);
  static const _tintAmber = Color(0xFFFAEEDA);
  static const _tintBlue = Color(0xFFE6F1FB);
  static const _tintRose = Color(0xFFF6E9EC);

  static const products = <Product>[
    Product(id: 'p1', nameAr: 'iPhone 16', merchantId: 'm1', merchantName: 'طاهر فون', category: 'هواتف ذكية', priceDzd: 200000, tint: _tintTeal, icon: Icons.smartphone),
    Product(id: 'p2', nameAr: 'iPhone 15 Pro', merchantId: 'm1', merchantName: 'طاهر فون', category: 'هواتف ذكية', priceDzd: 240000, tint: _tintTeal, icon: Icons.smartphone),
    Product(id: 'p3', nameAr: 'Samsung Galaxy S24', merchantId: 'm1', merchantName: 'طاهر فون', category: 'هواتف ذكية', priceDzd: 175000, tint: _tintTeal, icon: Icons.smartphone),
    Product(id: 'p4', nameAr: 'Samsung Galaxy A55', merchantId: 'm1', merchantName: 'طاهر فون', category: 'هواتف ذكية', priceDzd: 72000, tint: _tintTeal, icon: Icons.smartphone),
    Product(id: 'p5', nameAr: 'تلفاز Samsung 55 بوصة', merchantId: 'm4', merchantName: 'تامست إلكترونيك', category: 'تلفزيونات', priceDzd: 158000, tint: _tintBlue, icon: Icons.tv),
    Product(id: 'p6', nameAr: 'تلفاز LG 50 بوصة', merchantId: 'm4', merchantName: 'تامست إلكترونيك', category: 'تلفزيونات', priceDzd: 109000, tint: _tintBlue, icon: Icons.tv),
    Product(id: 'p7', nameAr: 'حاسوب HP Pavilion', merchantId: 'm6', merchantName: 'عالم الحاسوب', category: 'حواسيب', priceDzd: 132000, tint: _tintAmber, icon: Icons.laptop_mac),
    Product(id: 'p8', nameAr: 'MacBook Air M3', merchantId: 'm6', merchantName: 'عالم الحاسوب', category: 'حواسيب', priceDzd: 320000, tint: _tintAmber, icon: Icons.laptop_mac),
    Product(id: 'p9', nameAr: 'طقم صالون عصري', merchantId: 'm3', merchantName: 'أثاث توات', category: 'أثاث', priceDzd: 165000, tint: _tintRose, icon: Icons.weekend),
    Product(id: 'p10', nameAr: 'غرفة نوم كاملة', merchantId: 'm3', merchantName: 'أثاث توات', category: 'أثاث', priceDzd: 230000, tint: _tintRose, icon: Icons.bed),
    Product(id: 'p11', nameAr: 'ثلاجة LG 420 لتر', merchantId: 'm2', merchantName: 'إلكترو أدرار', category: 'أجهزة منزلية', priceDzd: 138000, tint: _tintBlue, icon: Icons.kitchen),
    Product(id: 'p12', nameAr: 'غسالة Condor', merchantId: 'm2', merchantName: 'إلكترو أدرار', category: 'أجهزة منزلية', priceDzd: 89000, tint: _tintBlue, icon: Icons.local_laundry_service),
  ];

  static final financings = <Financing>[
    Financing(
      reference: 'CRF-2026-000089',
      productName: 'iPhone 16',
      merchantName: 'طاهر فون',
      totalDzd: 230000,
      paidDzd: 38334,
      monthlyDzd: 19167,
      durationMonths: 12,
      paidCount: 2,
      nextDueDate: DateTime(2026, 6, 8),
      status: 'active',
      installments: _schedule(count: 12, paid: 2, monthly: 19167, activated: DateTime(2026, 4, 8)),
    ),
    Financing(
      reference: 'CRF-2026-000074',
      productName: 'غرفة نوم كاملة',
      merchantName: 'أثاث توات',
      totalDzd: 124200,
      paidDzd: 41400,
      monthlyDzd: 10350,
      durationMonths: 12,
      paidCount: 4,
      nextDueDate: DateTime(2026, 6, 15),
      status: 'active',
      installments: _schedule(count: 12, paid: 4, monthly: 10350, activated: DateTime(2026, 1, 15)),
    ),
    Financing(
      reference: 'CRF-2026-000051',
      productName: 'تلفاز LG 50 بوصة',
      merchantName: 'تامست إلكترونيك',
      totalDzd: 117720,
      paidDzd: 117720,
      monthlyDzd: 9810,
      durationMonths: 12,
      paidCount: 12,
      nextDueDate: DateTime(2026, 4, 20),
      status: 'completed',
      installments: _schedule(count: 12, paid: 12, monthly: 9810, activated: DateTime(2025, 4, 20)),
    ),
  ];

  static final requests = <FinancingRequest>[
    FinancingRequest(reference: 'CR-2026-000142', productName: 'Samsung Galaxy S24', merchantName: 'طاهر فون', amountDzd: 175000, planMonths: 12, status: 'under_review', createdAt: DateTime(2026, 5, 19)),
    FinancingRequest(reference: 'CR-2026-000128', productName: 'ثلاجة LG 420 لتر', merchantName: 'إلكترو أدرار', amountDzd: 138000, planMonths: 6, status: 'contracts_generated', createdAt: DateTime(2026, 5, 14)),
    FinancingRequest(reference: 'CR-2026-000102', productName: 'حاسوب HP Pavilion', merchantName: 'عالم الحاسوب', amountDzd: 132000, planMonths: 12, status: 'approved', createdAt: DateTime(2026, 4, 30)),
  ];

  static final notifications = <AppNotification>[
    AppNotification(id: 'n1', title: 'تم تأكيد دفعتك', body: 'تم تأكيد قسط شهر ماي لتمويل iPhone 16.', type: 'payment', date: DateTime(2026, 5, 20), read: false),
    AppNotification(id: 'n2', title: 'عقودك جاهزة', body: 'عقود طلب CR-2026-000128 جاهزة للتوقيع.', type: 'request', date: DateTime(2026, 5, 14), read: false),
    AppNotification(id: 'n3', title: 'تذكير بقسط', body: 'يحلّ قسط تمويل أثاث توات خلال 3 أيام.', type: 'payment', date: DateTime(2026, 5, 12), read: true),
    AppNotification(id: 'n4', title: 'تمت الموافقة على طلبك', body: 'تمت الموافقة على تمويل حاسوب HP Pavilion.', type: 'request', date: DateTime(2026, 4, 30), read: true),
    AppNotification(id: 'n5', title: 'تم اعتماد ملفك', body: 'تم اعتماد التحقق من هويتك بنجاح.', type: 'kyc', date: DateTime(2026, 4, 12), read: true),
  ];
}
