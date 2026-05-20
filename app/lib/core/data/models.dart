import 'package:flutter/material.dart';

class Category {
  final String id;
  final String nameAr;
  final IconData icon;
  const Category({required this.id, required this.nameAr, required this.icon});
}

class Merchant {
  final String id;
  final String slug;
  final String nameAr;
  final String category;
  final String commune;
  final double rating;
  final int productCount;
  final bool isPartner;
  const Merchant({
    required this.id,
    required this.slug,
    required this.nameAr,
    required this.category,
    required this.commune,
    required this.rating,
    required this.productCount,
    required this.isPartner,
  });
}

class Product {
  final String id;
  final String nameAr;
  final String merchantId;
  final String merchantName;
  final String category;
  final int priceDzd;
  final Color tint;
  final IconData icon;
  const Product({
    required this.id,
    required this.nameAr,
    required this.merchantId,
    required this.merchantName,
    required this.category,
    required this.priceDzd,
    required this.tint,
    required this.icon,
  });
}

class FinancingPlan {
  final int months;
  final double marginPct;
  const FinancingPlan({required this.months, required this.marginPct});

  int totalFor(int principal) => (principal * (1 + marginPct / 100)).round();
  int monthlyFor(int principal) => (totalFor(principal) / months).round();
}

class Installment {
  final int number;
  final DateTime dueDate;
  final int amountDzd;
  final String status; // paid · due · scheduled · late
  const Installment({
    required this.number,
    required this.dueDate,
    required this.amountDzd,
    required this.status,
  });
}

class Financing {
  final String reference;
  final String productName;
  final String merchantName;
  final int totalDzd;
  final int paidDzd;
  final int monthlyDzd;
  final int durationMonths;
  final int paidCount;
  final DateTime nextDueDate;
  final String status; // active · late · completed
  final List<Installment> installments;
  const Financing({
    required this.reference,
    required this.productName,
    required this.merchantName,
    required this.totalDzd,
    required this.paidDzd,
    required this.monthlyDzd,
    required this.durationMonths,
    required this.paidCount,
    required this.nextDueDate,
    required this.status,
    required this.installments,
  });

  int get remainingDzd => totalDzd - paidDzd;
  double get progress => durationMonths == 0 ? 0 : paidCount / durationMonths;
}

class FinancingRequest {
  final String reference;
  final String productName;
  final String merchantName;
  final int amountDzd;
  final int planMonths;
  final String status; // submitted · under_review · contracts_generated · approved · rejected
  final DateTime createdAt;
  const FinancingRequest({
    required this.reference,
    required this.productName,
    required this.merchantName,
    required this.amountDzd,
    required this.planMonths,
    required this.status,
    required this.createdAt,
  });
}

class AppNotification {
  final String id;
  final String title;
  final String body;
  final String type; // payment · request · kyc · promo
  final DateTime date;
  final bool read;
  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.date,
    required this.read,
  });
}

class CreditInfo {
  final int score;
  final String tier;
  final int limitDzd;
  final int usedDzd;
  const CreditInfo({
    required this.score,
    required this.tier,
    required this.limitDzd,
    required this.usedDzd,
  });

  int get availableDzd => limitDzd - usedDzd;
  double get usedRatio => limitDzd == 0 ? 0 : usedDzd / limitDzd;
}

class ClientProfile {
  final String name;
  final String phone;
  final String commune;
  final String kycStatus; // approved · pending · not_started
  const ClientProfile({
    required this.name,
    required this.phone,
    required this.commune,
    required this.kycStatus,
  });
}
