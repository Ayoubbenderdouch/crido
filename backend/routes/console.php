<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Crido — Cron Schedule
|--------------------------------------------------------------------------
|
| All Crido daily/hourly background jobs. See docs/BUSINESS_RULES.md and
| backend/CLAUDE.md ("Cron schedule" section) for the rationale behind
| each window.
|
| Each command class lives in app/Console/Commands/ and is auto-discovered
| by Laravel's package:discover.
|
| Operator note: a single host running `php artisan schedule:work` (or the
| crontab line `* * * * * cd /path && php artisan schedule:run`) is
| sufficient — Laravel handles the per-command timing internally.
|
*/

// --- Installment / Financing lifecycle ---

// 00:01 → flip scheduled→due, due→late after grace, late→missed after 30d.
Schedule::command('installments:update-statuses')->dailyAt('00:01');

// 02:00 → fix any tier drift against the score mapping (cheap).
Schedule::command('credit-scores:recalculate')->dailyAt('02:00');

// 06:00 → promote late financings to defaulted after default_threshold_days.
Schedule::command('financings:mark-defaulted')->dailyAt('06:00');

// Hourly → expire stale financing requests (request_expiry_days, default 7).
Schedule::command('financing-requests:expire-stale')->hourly();

// --- Outbound reminders (SMS/push TBD) ---

// 09:00 → reminders for installments due in 3, 1, 0 days.
Schedule::command('reminders:send-due-soon')->dailyAt('09:00');

// 10:00 → reminders for already-late installments.
Schedule::command('reminders:send-late')->dailyAt('10:00');

// --- Reporting ---

// 23:30 → daily operational snapshot to the daily log channel.
Schedule::command('reports:generate-daily')->dailyAt('23:30');
