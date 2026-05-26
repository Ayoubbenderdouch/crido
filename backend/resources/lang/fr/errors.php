<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Error Messages — French
    |--------------------------------------------------------------------------
    */

    // Generic
    'generic' => 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
    'unauthorized' => 'Vous n\'êtes pas autorisé à effectuer cette action.',
    'forbidden' => 'Action interdite.',
    'not_found' => 'Élément introuvable.',
    'validation_failed' => 'Les données saisies ne sont pas valides.',
    'rate_limited' => 'Trop de tentatives. Veuillez réessayer plus tard.',

    // ---------------------------------------------------------------------
    // Identity / Auth
    // ---------------------------------------------------------------------
    'invalid_credentials' => 'Identifiants invalides.',
    'user_inactive' => 'Votre compte est inactif. Contactez le support.',
    'invalid_phone_number' => 'Numéro de téléphone invalide.',
    'invalid_phone' => 'Numéro de téléphone invalide.',
    'phone_already_registered' => 'Ce numéro est déjà enregistré.',
    'otp_rate_limited' => 'Veuillez patienter avant de redemander un code.',
    'otp_not_found' => 'Aucun code de vérification trouvé pour ce numéro. Demandez-en un nouveau.',
    'otp_invalid' => 'Code incorrect ou expiré.',
    'verification_token_invalid' => 'Jeton de vérification invalide ou expiré.',
    'full_name_required' => 'Le nom complet est requis.',

    // ---------------------------------------------------------------------
    // Client / KYC
    // ---------------------------------------------------------------------
    'client_kyc_not_approved' => 'Votre identité doit être vérifiée avant toute demande de financement.',
    'kyc_not_approved' => 'Votre identité doit être vérifiée.',
    'client_is_blacklisted' => 'Ce client est sur liste noire et ne peut pas demander un financement.',
    'client_wilaya_not_supported' => 'Crido n\'est pas encore disponible dans votre wilaya. Nous commençons par Adrar.',
    'wilaya_not_supported' => 'Crido n\'est pas encore disponible dans votre wilaya. Nous commençons par Adrar.',
    'not_in_allowed_wilaya' => 'Crido n\'est pas disponible dans votre wilaya.',
    'invalid_document_type' => 'Type de document non pris en charge.',
    'kyc_file_storage_failed' => 'Échec de l\'enregistrement du fichier. Veuillez réessayer.',
    'kyc_missing_documents' => 'Documents de vérification manquants : :missing',
    'credit_limit_negative' => 'La limite de crédit ne peut pas être négative.',
    'credit_limit_exceeds_cap' => 'La limite de crédit dépasse le plafond autorisé.',
    'insufficient_credit_limit' => 'Limite de crédit insuffisante pour ce montant.',
    'insufficient_credit' => 'Limite de crédit insuffisante.',

    // ---------------------------------------------------------------------
    // Merchant
    // ---------------------------------------------------------------------
    'merchant_already_active' => 'Ce marchand est déjà actif.',
    'merchant_already_partner' => 'Ce marchand est déjà partenaire agréé.',
    'merchant_slug_taken' => 'Cet identifiant est déjà utilisé. Choisissez-en un autre.',
    'invalid_merchant_phone' => 'Numéro de téléphone du marchand invalide.',
    'invalid_called_phone' => 'Le numéro appelé est invalide.',
    'merchant_inactive_or_missing' => 'Marchand introuvable ou inactif.',
    'merchant_verification_required' => 'Le marchand doit d\'abord être vérifié.',
    'ad_hoc_merchant_not_verified' => 'Ce marchand ponctuel n\'a pas encore été vérifié.',
    'branch_does_not_belong_to_merchant' => 'L\'agence ne correspond pas à ce marchand.',
    'user_not_in_merchant_staff' => 'Vous ne faites pas partie de l\'équipe de ce marchand.',

    // ---------------------------------------------------------------------
    // Financing Request
    // ---------------------------------------------------------------------
    'request_not_in_approvable_state' => 'La demande ne peut pas être approuvée dans son état actuel.',
    'request_not_in_reviewable_state' => 'La demande ne peut pas être examinée dans son état actuel.',
    'request_not_in_submittable_state' => 'Cette demande ne peut pas être modifiée dans son état actuel.',
    'request_not_in_contract_ready_state' => 'Impossible de générer les contrats — la demande n\'est pas dans le bon état.',
    'request_already_terminal' => 'Cette demande est clôturée et ne peut plus être modifiée.',
    'request_not_cancellable' => 'Cette demande ne peut pas être annulée dans son état actuel.',
    'request_missing_merchant' => 'La demande n\'est associée à aucun marchand.',
    'request_has_no_merchant' => 'La demande n\'a pas de marchand.',
    'proposed_merchant_invalid' => 'Les informations du marchand proposé sont incomplètes ou invalides.',

    // Plans / Amounts
    'financing_plan_invalid' => 'Le plan de financement sélectionné est invalide.',
    'financing_plan_not_found' => 'Plan de financement introuvable.',
    'financing_plan_inactive' => 'Le plan de financement sélectionné n\'est pas actif.',
    'amount_below_plan_minimum' => 'Le montant est inférieur au minimum autorisé pour ce plan.',
    'amount_above_plan_maximum' => 'Le montant est supérieur au maximum autorisé pour ce plan.',
    'amount_must_be_positive' => 'Le montant doit être supérieur à zéro.',

    // ---------------------------------------------------------------------
    // Contracts
    // ---------------------------------------------------------------------
    'contract_not_awaiting_verification' => 'Ce contrat n\'est pas en attente de vérification.',
    'contract_already_resolved' => 'Ce contrat a déjà été traité.',
    'contract_not_linked_to_financing' => 'Le contrat n\'est pas lié à une demande de financement.',
    'contract_does_not_belong_to_client' => 'Ce contrat ne vous appartient pas.',

    // ---------------------------------------------------------------------
    // Financing
    // ---------------------------------------------------------------------
    'financing_not_found' => 'Financement introuvable.',
    'financing_does_not_belong_to_client' => 'Ce financement ne vous appartient pas.',
    'financing_reference_required' => 'La référence du financement est requise.',
    'installment_not_in_financing' => 'Cette échéance n\'appartient pas au financement spécifié.',
    'no_open_installment' => 'Aucune échéance ouverte à régler.',
    'cannot_write_off_completed_financing' => 'Impossible de radier un financement déjà terminé.',

    // ---------------------------------------------------------------------
    // Payments
    // ---------------------------------------------------------------------
    'payment_not_awaiting_proof' => 'Ce paiement n\'attend pas de preuve.',
    'payment_not_pending_verification' => 'Ce paiement n\'est pas en attente de vérification.',
    'payment_not_rejectable' => 'Ce paiement ne peut pas être rejeté dans son état actuel.',
    'payment_relations_missing' => 'Les données du paiement sont incomplètes.',

    // ---------------------------------------------------------------------
    // Payouts
    // ---------------------------------------------------------------------
    'payout_not_payable' => 'Ce virement ne peut pas être payé dans son état actuel.',
    'invalid_payout_method' => 'Mode de versement non pris en charge.',
    'user_is_not_an_agent' => 'L\'utilisateur sélectionné n\'est pas un agent terrain.',

    // ---------------------------------------------------------------------
    // Risk
    // ---------------------------------------------------------------------
    'invalid_blacklist_severity' => 'Le niveau de liste noire est invalide.',

    // ---------------------------------------------------------------------
    // Generic file / upload
    // ---------------------------------------------------------------------
    'file_too_large' => 'Fichier trop volumineux. Taille maximale : :max.',
    'file_invalid_type' => 'Type de fichier non pris en charge.',
    'image_dimensions_too_small' => 'La résolution de l\'image est trop faible.',

];
