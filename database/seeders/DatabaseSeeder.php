<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Hardened Seeder: Permissions and Core Administrative Accounts only.
     */
    public function run(): void
    {
        // ── STAGE 1: Superadmin & HR Manager Accounts ──────────────────────
        User::firstOrCreate(
            ['email' => 'superadmin@cameco.com'],
            [
                'name'              => 'Alex Tamayo',
                'username'          => 'superadmin',
                'password'          => 'password',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'hrmanager@cameco.com'],
            [
                'name'              => 'Mitch Magno',
                'username'          => 'hrmanager',
                'password'          => 'password',
                'email_verified_at' => now(),
            ]
        );

            User::firstOrCreate(
            ['email' => 'hrstaff@cameco.com'],
            [
                'name'              => 'Kobe Bryant',
                'username'          => 'hrstaff',
                'password'          => 'password',
                'email_verified_at' => now(),
            ]
        );

        // ── STAGE 2: Permissions & Roles ────────────────────────────────────
        $this->call([
            RolesAndPermissionsSeeder::class,
        ]);

        // Flush Spatie cache before role assignment
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ── STAGE 3: Assign Roles to Core Accounts ──────────────────────────
        $superadmin = User::where('email', 'superadmin@cameco.com')->first();
        if ($superadmin) {
            $superadmin->assignRole('Superadmin');
        }

        $hrManager = User::where('email', 'hrmanager@cameco.com')->first();
        if ($hrManager) {
            $hrManager->assignRole('HR Manager');
        }

        $hrStaff = User::where('email', 'hrstaff@cameco.com')->first();
        if ($hrStaff) {
            $hrStaff->assignRole('HR Staff');
        }   

        $payrollOfficer = User::where('email', 'payrollofficer@cameco.com')->first();
        if ($payrollOfficer) {
            $payrollOfficer->assignRole('Payroll Officer');
        }   

        // ── STAGE 5: Core System Configuration ──────────────────────────────
        $this->call([
            SystemSettingsSeeder::class,
        ]);

        // Final cache flush
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}