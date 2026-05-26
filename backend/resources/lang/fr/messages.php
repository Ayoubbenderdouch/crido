<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Application Messages — French
    |--------------------------------------------------------------------------
    */

    // Generic
    'success' => 'Opération réussie.',
    'created' => 'Création effectuée avec succès.',
    'updated' => 'Mise à jour effectuée avec succès.',
    'deleted' => 'Suppression effectuée avec succès.',
    'saved' => 'Enregistrement effectué.',
    'not_found' => 'Élément introuvable.',
    'unauthorized' => 'Vous n\'êtes pas autorisé à effectuer cette action.',

    // Auth
    'otp_sent' => 'Un code de vérification a été envoyé au :phone.',
    'otp_verified' => 'Code vérifié avec succès.',
    'register_success' => 'Votre compte a été créé. Bienvenue chez Crido.',
    'login_success' => 'Connexion réussie.',
    'logout_success' => 'Vous êtes déconnecté.',
    'password_changed' => 'Mot de passe modifié avec succès.',
    'password_reset_sent' => 'Le code de réinitialisation a été envoyé.',

    // Client / KYC
    'profile_updated' => 'Vos informations ont été mises à jour.',
    'kyc_document_uploaded' => 'Document téléversé : :type.',
    'kyc_submitted' => 'Demande de vérification envoyée. Nous examinerons vos documents rapidement.',
    'kyc_approved' => 'Votre identité a été vérifiée avec succès.',
    'kyc_rejected' => 'Vérification d\'identité refusée. Vous pouvez réessayer après correction.',
    'credit_limit_updated' => 'Limite de crédit mise à jour à :amount.',

    // Merchant
    'merchant_created' => 'Marchand :name créé avec succès.',
    'merchant_updated' => 'Informations du marchand mises à jour.',
    'merchant_approved' => 'Marchand activé avec succès.',
    'merchant_suspended' => 'Marchand suspendu temporairement.',
    'merchant_converted_to_partner' => 'Marchand converti en partenaire agréé.',
    'merchant_confirmed' => 'Demande confirmée par le marchand.',
    'merchant_rejected_request' => 'Le marchand a rejeté la demande.',
    'merchant_verification_logged' => 'Appel de vérification enregistré.',
    'staff_invited' => ':name a été invité à rejoindre l\'équipe du marchand.',
    'branch_created' => 'Agence créée avec succès.',
    'branch_updated' => 'Agence mise à jour.',

    // Product
    'product_created' => 'Produit créé.',
    'product_updated' => 'Produit mis à jour.',
    'product_deleted' => 'Produit supprimé.',
    'product_images_uploaded' => 'Images du produit téléversées.',

    // Financing Request
    'financing_request_created' => 'Demande de financement :ref créée.',
    'financing_request_submitted' => 'Votre demande a été envoyée. Elle sera examinée sous 24 heures.',
    'financing_request_approved' => 'Demande de financement :ref approuvée.',
    'financing_request_rejected' => 'Demande de financement :ref rejetée.',
    'financing_request_cancelled' => 'Demande de financement annulée.',
    'financing_request_under_review' => 'La demande est passée en cours d\'examen.',
    'financing_request_documents_requested' => 'Des documents supplémentaires ont été demandés au client.',
    'documents_requested' => 'Documents supplémentaires demandés.',
    'contracts_generated' => 'Contrats générés avec succès.',
    'signed_contract_uploaded' => 'Contrat signé téléversé.',
    'contract_signature_verified' => 'Signature vérifiée.',
    'contract_signature_rejected' => 'Signature refusée. Veuillez signer à nouveau.',
    'contract_regenerated' => 'Contrat régénéré.',

    // Financing
    'financing_activated' => 'Financement :ref activé. Mensualité : :amount.',
    'financing_completed' => 'Félicitations ! Votre financement :ref est soldé.',
    'financing_defaulted' => 'Le financement :ref est marqué en défaut.',
    'financing_written_off' => 'Le financement :ref a été radié.',
    'installment_rescheduled' => 'Échéance reprogrammée au :date.',
    'financing_simulation' => 'Ceci est une simulation — le prix final sera confirmé après approbation.',

    // Payment
    'payment_created' => 'Paiement :ref enregistré. Téléversez la preuve pour le valider.',
    'payment_proof_uploaded' => 'Preuve de paiement reçue. Nous la vérifierons rapidement.',
    'payment_verified' => 'Paiement :ref vérifié.',
    'payment_rejected' => 'Paiement :ref rejeté. :reason',

    // Payout
    'payout_created' => 'Virement marchand :ref créé.',
    'payout_assigned' => ':agent a été assigné au virement :ref.',
    'payout_paid' => ':amount versé au marchand :merchant.',
    'payouts_processed' => ':count virements marchands traités.',

    // Field activities
    'field_activity_created' => 'Mission terrain créée.',
    'field_activity_completed' => 'Mission terrain terminée.',
    'field_activity_failed' => 'Mission terrain non aboutie.',

    // Collection
    'collection_action_logged' => 'Action de recouvrement enregistrée.',
    'client_blacklisted' => 'Client ajouté à la liste noire.',

    // Settings / Catalog
    'setting_updated' => 'Paramètre :key mis à jour.',
    'plan_created' => 'Plan de financement créé.',
    'plan_updated' => 'Plan de financement mis à jour.',
    'plan_deleted' => 'Plan de financement supprimé.',
    'category_created' => 'Catégorie créée.',
    'category_updated' => 'Catégorie mise à jour.',
    'offer_created' => 'Offre créée.',
    'offer_updated' => 'Offre mise à jour.',
    'bank_updated' => 'Banque mise à jour.',
    'commission_rate_updated' => 'Taux de commission mis à jour.',

    // Users
    'user_created' => 'Utilisateur :name créé.',
    'user_updated' => 'Utilisateur mis à jour.',

    // Reports
    'report_generated' => 'Rapport généré.',
    'report_exported' => 'Rapport exporté.',

    // Geographic
    'wilaya_not_supported' => 'Crido n\'est pas encore disponible dans votre wilaya. Nous commençons par Adrar.',

    // Status labels
    'status' => [
        // Client KYC
        'kyc_not_started' => 'Non démarré',
        'kyc_pending' => 'En cours d\'examen',
        'kyc_approved' => 'Approuvé',
        'kyc_rejected' => 'Refusé',
        'kyc_expired' => 'Expiré',

        // Financing request
        'draft' => 'Brouillon',
        'submitted' => 'Envoyé',
        'merchant_confirmed' => 'Confirmé par le marchand',
        'under_review' => 'En cours d\'examen',
        'documents_required' => 'Documents requis',
        'contracts_generated' => 'Contrats générés',
        'contracts_signed' => 'Contrats signés',
        'approved' => 'Approuvé',
        'rejected' => 'Refusé',
        'cancelled' => 'Annulé',
        'expired' => 'Expiré',

        // Financing
        'active' => 'Actif',
        'late' => 'En retard',
        'completed' => 'Terminé',
        'defaulted' => 'En défaut',
        'written_off' => 'Radié',

        // Payment
        'pending_proof' => 'En attente de preuve',
        'pending_verification' => 'En attente de vérification',
        'verified' => 'Vérifié',

        // Payout
        'pending' => 'En attente',
        'processing' => 'En traitement',
        'paid' => 'Payé',
        'failed' => 'Échoué',

        // Generic
        'active_user' => 'Actif',
        'inactive' => 'Inactif',
        'suspended' => 'Suspendu',
    ],

    // Merchant source
    'merchant_source' => [
        'partner' => 'Partenaire',
        'ad_hoc' => 'Ponctuel',
    ],

    // Days of the week
    'days' => [
        'sunday' => 'Dimanche',
        'monday' => 'Lundi',
        'tuesday' => 'Mardi',
        'wednesday' => 'Mercredi',
        'thursday' => 'Jeudi',
        'friday' => 'Vendredi',
        'saturday' => 'Samedi',
    ],

    // Months (Algerian convention)
    'months' => [
        1 => 'Janvier',
        2 => 'Février',
        3 => 'Mars',
        4 => 'Avril',
        5 => 'Mai',
        6 => 'Juin',
        7 => 'Juillet',
        8 => 'Août',
        9 => 'Septembre',
        10 => 'Octobre',
        11 => 'Novembre',
        12 => 'Décembre',
    ],

];
