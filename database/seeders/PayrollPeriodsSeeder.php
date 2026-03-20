<?php

namespace Database\Seeders;

use App\Models\PayrollPeriod;
use App\Models\User;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PayrollPeriodsSeeder extends Seeder
{
    /**
     * Seed payroll periods for testing the payments module.
     * Creates periods for the last 6 months with various statuses.
     */
    public function run(): void
    {
        // Always create a fresh completed payroll period for demo/testing
        $now = Carbon::now();
        $periodStart = $now->copy()->startOfMonth();
        $periodEnd = $periodStart->copy()->day(15);
        $paymentDate = $periodEnd->copy()->addDays(2);
        $periodNumber = sprintf('%s-%02d-1H', $periodStart->year, $periodStart->month);
        $payrollOfficer = User::where('email', 'payroll@cameco.com')->first();
        $hrManager = User::where('email', 'hrmanager@cameco.com')->first();
        $creatorId = $payrollOfficer?->id ?? $hrManager?->id ?? 1;
        $approverId = $hrManager?->id ?? $creatorId;
        $totalEmployees = Employee::count();
        $activeEmployees = Employee::where('status', 'active')->count();
        $excludedEmployees = max(0, $totalEmployees - $activeEmployees);
        // Remove any existing period with this number (for idempotency)
        PayrollPeriod::where('period_number', $periodNumber)->delete();
        $periodsToDelete = [];
        // We'll collect all period_numbers to be inserted and delete them before insert
        // ...existing code...

        // Get actual employee counts from database
        $totalEmployees = Employee::count();
        $activeEmployees = Employee::where('status', 'active')->count();
        $excludedEmployees = max(0, $totalEmployees - $activeEmployees);

        if ($totalEmployees === 0) {
            $this->command->warn('No employees found in database — skipping payroll periods seeding.');
            return;
        }

        $this->command->info("Found {$totalEmployees} total employees, {$activeEmployees} active");

        $payrollOfficer = User::where('email', 'payroll@cameco.com')->first();
        $hrManager = User::where('email', 'hrmanager@cameco.com')->first();
        $creatorId = $payrollOfficer?->id ?? $hrManager?->id ?? 1;
        $approverId = $hrManager?->id ?? $creatorId;
        $periodsToDelete = [];

        $now = Carbon::now();
        $periods = [];

        // Create 6 periods (last 6 months)
        for ($i = 5; $i >= 0; $i--) {
            $periodStart = $now->copy()->subMonths($i)->startOfMonth();
            $periodEnd = $periodStart->copy()->day(15);
            $paymentDate = $periodEnd->copy()->addDays(2);
            $periodNumber = sprintf('%s-%02d-1H', $periodStart->year, $periodStart->month);
            // ...existing code for status, etc...
            // Collect period numbers for deletion
            $periodsToDelete[] = $periodNumber;
            // ...existing code for $periods[]...
            // Second half of the month
            $periodStart2 = $periodEnd->copy()->addDay();
            $periodEnd2 = $periodStart->copy()->endOfMonth();
            $paymentDate2 = $periodEnd2->copy()->addDays(2);
            $periodNumber2 = sprintf('%s-%02d-2H', $periodStart->year, $periodStart->month);
            $periodsToDelete[] = $periodNumber2;
            // ...existing code for $periods[]...
        }

        // Remove any existing periods with the same period_number (idempotent bulk delete)
        PayrollPeriod::whereIn('period_number', $periodsToDelete)->delete();

        PayrollPeriod::insert($periods);

        $this->command->info('✅ Seeded ' . count($periods) . ' payroll periods (6 months, semi-monthly)');
    }
}
