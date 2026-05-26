<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Notifications — French
    |--------------------------------------------------------------------------
    */

    // ---------------------------------------------------------------------
    // Auth / OTP
    // ---------------------------------------------------------------------
    'otp_sms' => [
        'body' => 'Crido : votre code de vérification est :code. Valide :minutes minutes. Ne le partagez avec personne.',
    ],

    'welcome' => [
        'title' => 'Bienvenue chez Crido',
        'body' => 'Bonjour :name, votre compte est prêt. Commencez par vérifier votre identité.',
    ],

    // ---------------------------------------------------------------------
    // KYC
    // ---------------------------------------------------------------------
    'kyc_approved' => [
        'title' => 'Identité vérifiée',
        'body' => 'Votre identité a été vérifiée. Vous pouvez maintenant demander un financement.',
    ],

    'kyc_rejected' => [
        'title' => 'Vérification refusée',
        'body' => 'Votre vérification d\'identité a été refusée : :reason. Vous pouvez réessayer après correction.',
    ],

    'kyc_documents_required' => [
        'title' => 'Documents supplémentaires requis',
        'body' => 'Nous avons besoin de documents supplémentaires pour finaliser la vérification : :documents',
    ],

    // ---------------------------------------------------------------------
    // Financing Request
    // ---------------------------------------------------------------------
    'request_submitted' => [
        'title' => 'Demande reçue',
        'body' => 'Votre demande de financement :ref a bien été reçue. Elle sera examinée sous 24 heures.',
    ],

    'request_under_review' => [
        'title' => 'Demande en cours d\'examen',
        'body' => 'L\'examen de votre demande :ref a commencé. Nous vous tiendrons informé.',
    ],

    'request_documents_required' => [
        'title' => 'Documents requis',
        'body' => 'Pour finaliser votre demande :ref, il nous faut : :documents',
    ],

    'request_approved' => [
        'title' => 'Demande approuvée',
        'body' => 'Félicitations ! Votre demande :ref est approuvée. Mensualité : :amount.',
    ],

    'request_rejected' => [
        'title' => 'Demande refusée',
        'body' => 'Votre demande :ref a été refusée. :reason',
    ],

    'merchant_confirmation_needed' => [
        'title' => 'Nouvelle demande client',
        'body' => ':client demande un financement pour :product (:amount). Confirmez ou refusez.',
    ],

    'merchant_request_confirmed' => [
        'title' => 'Demande confirmée',
        'body' => 'Le marchand a confirmé votre demande :ref. L\'examen va débuter.',
    ],

    'merchant_request_rejected' => [
        'title' => 'Demande refusée par le marchand',
        'body' => 'Le marchand a refusé votre demande :ref. Vous pouvez essayer avec un autre marchand.',
    ],

    // ---------------------------------------------------------------------
    // Contracts
    // ---------------------------------------------------------------------
    'contracts_ready_to_sign' => [
        'title' => 'Contrats prêts à signer',
        'body' => 'Les contrats de votre demande :ref sont prêts. Téléchargez, signez et envoyez pour activer le financement.',
    ],

    'signed_contract_verified' => [
        'title' => 'Signature vérifiée',
        'body' => 'Votre signature sur le contrat :ref a été vérifiée. Le financement sera activé sous peu.',
    ],

    'signed_contract_rejected' => [
        'title' => 'Veuillez signer à nouveau',
        'body' => 'Nous n\'avons pas pu valider votre signature pour :ref. :reason',
    ],

    // ---------------------------------------------------------------------
    // Financing — activation, payment, completion
    // ---------------------------------------------------------------------
    'financing_activated' => [
        'title' => 'Financement activé',
        'body' => 'Votre financement :ref est activé. Mensualité :amount à régler le :date.',
    ],

    'financing_completed' => [
        'title' => 'Financement terminé',
        'body' => 'Votre financement :ref est entièrement soldé. Merci de votre confiance.',
    ],

    'financing_defaulted' => [
        'title' => 'Alerte : retard de paiement',
        'body' => 'Votre financement :ref est en défaut. Contactez-nous immédiatement pour régulariser.',
    ],

    // ---------------------------------------------------------------------
    // Payment reminders & status
    // ---------------------------------------------------------------------
    'payment_reminder_upcoming' => [
        'title' => 'Rappel d\'échéance',
        'body' => 'Votre échéance :amount pour le financement :ref est due le :date. Préparez le règlement.',
    ],

    'payment_reminder' => [
        'title' => 'Rappel de paiement',
        'body' => 'Rappel : échéance :ref due le :date.',
    ],

    'payment_due_today' => [
        'title' => 'Échéance aujourd\'hui',
        'body' => 'Votre échéance :amount pour le financement :ref est due aujourd\'hui. Réglez via l\'application.',
    ],

    'payment_late' => [
        'title' => 'Échéance en retard',
        'body' => 'Votre échéance :ref est en retard de :days jours. Veuillez régler pour éviter des actions supplémentaires.',
    ],

    'payment_received' => [
        'title' => 'Paiement reçu',
        'body' => 'Nous avons bien reçu votre paiement de :amount. Vérification en cours.',
    ],

    'payment_verified' => [
        'title' => 'Paiement vérifié',
        'body' => 'Votre paiement :ref de :amount a été vérifié. Merci.',
    ],

    'payment_rejected' => [
        'title' => 'Paiement refusé',
        'body' => 'Votre paiement :ref a été refusé. Motif : :reason. Veuillez le renvoyer.',
    ],

    // ---------------------------------------------------------------------
    // Merchant — payouts
    // ---------------------------------------------------------------------
    'payout_ready' => [
        'title' => 'Virement prêt',
        'body' => 'Un virement de :amount est prêt. Référence : :ref.',
    ],

    'payout_paid' => [
        'title' => 'Virement effectué',
        'body' => ':amount viré sur votre compte. Référence : :ref.',
    ],

    'payout_agent_assigned' => [
        'title' => 'Agent terrain assigné',
        'body' => ':agent vous contactera pour vous remettre :amount en espèces aujourd\'hui.',
    ],

    // ---------------------------------------------------------------------
    // Admin / Internal
    // ---------------------------------------------------------------------
    'admin_new_kyc' => [
        'title' => 'Nouveau dossier KYC',
        'body' => 'Le client :name a envoyé ses documents de vérification.',
    ],

    'admin_new_request' => [
        'title' => 'Nouvelle demande de financement',
        'body' => 'Nouvelle demande :ref de :client pour :amount.',
    ],

    'admin_ad_hoc_verification_needed' => [
        'title' => 'Marchand ponctuel à vérifier',
        'body' => 'La demande :ref nécessite une vérification téléphonique du marchand :merchant.',
    ],

    'admin_new_payment_proof' => [
        'title' => 'Nouvelle preuve de paiement',
        'body' => 'Le client :client a téléversé une preuve de paiement de :amount.',
    ],

];
