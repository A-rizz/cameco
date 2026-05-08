<?php

namespace Tests\Feature\HR;

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Position;
use App\Models\Profile;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class EmployeeManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles and permissions
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    /**
     * Test that an HR Manager can view the employee directory.
     */
    public function test_hr_manager_can_view_employee_index()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $response = $this->actingAs($user)
            ->get(route('hr.employees.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HR/Employees/Index')
            ->has('employees')
            ->has('filters')
            ->has('statistics')
        );
    }

    /**
     * Test that an HR Manager can create a new employee.
     */
    public function test_hr_manager_can_create_employee()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $department = Department::create(['name' => 'IT Department', 'code' => 'ITD']);
        $position = Position::create([
            'title' => 'Software Engineer',
            'code' => 'SWE001',
            'department_id' => $department->id,
            'level' => 'junior'
        ]);

        $employeeData = [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane.doe@example.com',
            'gender' => 'female',
            'civil_status' => 'single',
            'date_of_birth' => '1995-05-15',
            'department_id' => $department->id,
            'position_id' => $position->id,
            'employment_type' => 'regular',
            'date_hired' => now()->format('Y-m-d'),
            'status' => 'active',
        ];

        // The store method expects multipart/form-data but we can send as post
        $response = $this->actingAs($user)
            ->postJson(route('hr.employees.store'), $employeeData);

        $response->assertStatus(201);
        
        $this->assertDatabaseHas('profiles', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane.doe@example.com',
        ]);

        $this->assertDatabaseHas('employees', [
            'department_id' => $department->id,
            'position_id' => $position->id,
        ]);
    }

    /**
     * Test that an HR Manager can view a specific employee profile.
     */
    public function test_hr_manager_can_view_employee_profile()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        // Create an employee with profile
        $department = Department::create(['name' => 'HR', 'code' => 'HRD']);
        $position = Position::create([
            'title' => 'HR Specialist',
            'code' => 'HRS001',
            'department_id' => $department->id,
            'level' => 'junior'
        ]);

        $employee = Employee::factory()->create([
            'department_id' => $department->id,
            'position_id' => $position->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('hr.employees.show', $employee));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HR/Employees/Show')
            ->has('employee')
            ->where('employee.id', $employee->id)
        );
    }

    /**
     * Test that unauthorized users cannot access employee management.
     */
    public function test_regular_user_cannot_view_employee_index()
    {
        $user = User::factory()->create();
        // No roles assigned

        $response = $this->actingAs($user)
            ->get(route('hr.employees.index'));

        // Should be forbidden or redirected based on middleware
        // Given EnsureHRAccess middleware usually redirects or aborts 403
        $response->assertForbidden();
    }
}
