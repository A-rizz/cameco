<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Profile;
use App\Models\Employee;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class HRStaffAccountSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating HR Staff account...');

        // Ensure role exists
        $role = Role::firstOrCreate(['name' => 'HR Staff'], ['guard_name' => 'web']);

        // Find HR department if exists
        $hrDept = DB::table('departments')->where('code', 'HR')->first();
        $hrDeptId = $hrDept?->id ?? null;

        // Find a default position for HR Staff if available
        $position = DB::table('positions')->where('title', 'HR Specialist')->first();
        $positionId = $position?->id ?? null;

        // Superadmin fallback for created_by
        $superadmin = User::where('email', 'superadmin@cameco.com')->first();
        $createdBy = $superadmin ? $superadmin->id : 1;

        // Create user
        $email = 'hrstaff@cameco.com';
        $passwordPlain = 'password';

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => 'HR Staff',
                'username' => 'hrstaff',
                'password' => Hash::make($passwordPlain),
                'email_verified_at' => now(),
            ]
        );

        // Create profile
        $profile = Profile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'user_id' => $user->id,
                'first_name' => 'HR',
                'middle_name' => null,
                'last_name' => 'Staff',
                'gender' => 'female',
                'civil_status' => 'single',
                'date_of_birth' => '1990-01-01',
            ]
        );

        // Create an employee record (if employees table exists)
        try {
            $employee = Employee::firstOrCreate(
                ['employee_number' => 'EMP-HR-0001'],
                [
                    'user_id' => $user->id,
                    'profile_id' => $profile->id,
                    'email' => $email,
                    'employee_number' => 'EMP-HR-0001',
                    'department_id' => $hrDeptId,
                    'position_id' => $positionId,
                    'employment_type' => 'regular',
                    'date_hired' => now()->subYears(1)->format('Y-m-d'),
                    'regularization_date' => now()->subMonths(6)->format('Y-m-d'),
                    'status' => 'active',
                    'created_by' => $createdBy,
                    'updated_by' => $createdBy,
                ]
            );
        } catch (\Throwable $e) {
            // ignore if employees table doesn't exist yet in some environments
        }

        // Assign role
        if (!$user->hasRole('HR Staff')) {
            $user->assignRole('HR Staff');
        }

        $this->command->info('✓ HR Staff created: ' . $email);
        $this->command->info('  Password: ' . $passwordPlain);
    }
}
