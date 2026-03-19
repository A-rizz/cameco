<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OffboardingCase;
use App\Models\Employee;
use App\Models\User;
use App\Models\Department;
use App\Services\HR\OffboardingService;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OffboardingSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure at least one department, HR user, and employee exist
        $department = Department::firstOrCreate(['id' => 1], ['name' => 'HR']);
        $user = User::firstOrCreate(
            ['email' => 'hrstaff@example.com'],
            [
                'name' => 'HR Staff',
                'password' => bcrypt('password'),
            ]
        );
        $employee = Employee::firstOrCreate(
            ['employee_number' => 'EMP-1001'],
            [
                'profile_id' => 1,
                'department_id' => $department->id,
                'user_id' => $user->id,
                'status' => 'active',
                'position_id' => 1,
                'employment_type' => 'regular',
                'date_hired' => now()->subYears(2),
                'created_by' => $user->id,
            ]
        );

        // 2. Create 3 offboarding cases for this employee
        $service = app(OffboardingService::class);
        for ($i = 1; $i <= 3; $i++) {
            $case = OffboardingCase::create([
                'employee_id' => $employee->id,
                'initiated_by' => $user->id,
                'case_number' => $service->generateCaseNumber(),
                'separation_type' => 'resignation',
                'separation_reason' => 'Personal reasons',
                'last_working_day' => Carbon::now()->addDays(10 * $i),
                'notice_period_days' => 30,
                'status' => 'pending',
                'resignation_submitted_at' => Carbon::now()->subDays(2 * $i),
                'hr_coordinator_id' => $user->id,
            ]);
            $service->createDefaultClearanceItems($case);
            $service->createDefaultAccessRevocations($case);
        }
        $this->command->info('Seeded 3 offboarding cases with default clearance items and access revocations.');
    }
}
