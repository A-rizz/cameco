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
     * Test that an HR Manager can update an employee.
     */
    public function test_hr_manager_can_update_employee()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $department = Department::create(['name' => 'HR', 'code' => 'HRD']);
        $position = Position::create(['title' => 'HR Specialist', 'code' => 'HRS001', 'department_id' => $department->id, 'level' => 'junior']);
        $employee = Employee::factory()->create(['department_id' => $department->id, 'position_id' => $position->id]);

        $updateData = [
            'first_name' => 'Jane Updated',
            'last_name' => 'Doe Updated',
            'email' => 'jane.updated@example.com',
            'gender' => 'female',
            'civil_status' => 'married',
            'date_of_birth' => '1995-05-15',
            'department_id' => $department->id,
            'position_id' => $position->id,
            'employment_type' => 'regular',
            'date_hired' => $employee->date_hired,
            'status' => 'active',
        ];

        $response = $this->actingAs($user)
            ->putJson(route('hr.employees.update', $employee), $updateData);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('profiles', [
            'id' => $employee->profile_id,
            'first_name' => 'Jane Updated',
            'last_name' => 'Doe Updated',
            'email' => 'jane.updated@example.com',
        ]);
    }

    /**
     * Test that an HR Manager can archive (delete) an employee.
     */
    public function test_hr_manager_can_archive_employee()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $department = Department::create(['name' => 'HR', 'code' => 'HRD']);
        $position = Position::create(['title' => 'HR Specialist', 'code' => 'HRS001', 'department_id' => $department->id, 'level' => 'junior']);
        $employee = Employee::factory()->create(['department_id' => $department->id, 'position_id' => $position->id]);

        $response = $this->actingAs($user)
            ->delete(route('hr.employees.destroy', $employee), [
                'reason' => 'Left the company',
                'termination_date' => now()->format('Y-m-d')
            ]);

        $response->assertRedirect(route('hr.employees.index'));
        
        $this->assertSoftDeleted('employees', [
            'id' => $employee->id,
        ]);
        
        $this->assertDatabaseHas('employees', [
            'id' => $employee->id,
            'status' => 'archived',
        ]);
    }

    /**
     * Test that an HR Manager can change an employee's status.
     */
    public function test_hr_manager_can_change_employee_status()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $department = Department::create(['name' => 'HR', 'code' => 'HRD']);
        $position = Position::create(['title' => 'HR Specialist', 'code' => 'HRS001', 'department_id' => $department->id, 'level' => 'junior']);
        $employee = Employee::factory()->create(['department_id' => $department->id, 'position_id' => $position->id, 'status' => 'active']);

        $response = $this->actingAs($user)
            ->post(route('hr.employees.status', $employee), [
                'status' => 'on_leave',
                'reason' => 'Maternity leave'
            ]);

        $response->assertStatus(302); // Redirect back
        
        $this->assertDatabaseHas('employees', [
            'id' => $employee->id,
            'status' => 'on_leave',
        ]);
    }

    /**
     * Test that an HR Manager can add a dependent to an employee.
     */
    public function test_hr_manager_can_add_dependent()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $department = Department::create(['name' => 'HR', 'code' => 'HRD']);
        $position = Position::create(['title' => 'HR Specialist', 'code' => 'HRS001', 'department_id' => $department->id, 'level' => 'junior']);
        $employee = Employee::factory()->create(['department_id' => $department->id, 'position_id' => $position->id]);

        $dependentData = [
            'first_name' => 'Child',
            'last_name' => 'Doe',
            'relationship' => 'child',
            'date_of_birth' => '2020-01-01',
        ];

        $response = $this->actingAs($user)
            ->post(route('hr.employees.dependents.store', $employee), $dependentData);

        $response->assertStatus(302);
        
        $this->assertDatabaseHas('employee_dependents', [
            'employee_id' => $employee->id,
            'first_name' => 'Child',
            'last_name' => 'Doe',
        ]);
    }

    /**
     * Test that an HR Manager can add a remark (note) to an employee.
     */
    public function test_hr_manager_can_add_remark()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $department = Department::create(['name' => 'HR', 'code' => 'HRD']);
        $position = Position::create(['title' => 'HR Specialist', 'code' => 'HRS001', 'department_id' => $department->id, 'level' => 'junior']);
        $employee = Employee::factory()->create(['department_id' => $department->id, 'position_id' => $position->id]);

        $response = $this->actingAs($user)
            ->post(route('hr.employees.remarks.store', $employee), [
                'remark' => 'This is a test remark'
            ]);

        $response->assertStatus(302);
        
        $this->assertDatabaseHas('employee_remarks', [
            'employee_id' => $employee->id,
            'remark' => 'This is a test remark',
            'created_by' => $user->id,
        ]);
    }

    /**
     * Test that an HR Manager can view the print page for an employee.
     */
    public function test_hr_manager_can_print_employee_profile()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $department = Department::create(['name' => 'HR', 'code' => 'HRD']);
        $position = Position::create(['title' => 'HR Specialist', 'code' => 'HRS001', 'department_id' => $department->id, 'level' => 'junior']);
        $employee = Employee::factory()->create(['department_id' => $department->id, 'position_id' => $position->id]);

        $response = $this->actingAs($user)
            ->get(route('hr.employees.print', $employee));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HR/Employees/Print')
            ->has('employee')
        );
    }

    /**
     * Test that HR Staff can view the employee directory.
     */
    public function test_hr_staff_can_view_employee_index()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Staff');

        $response = $this->actingAs($user)
            ->get(route('hr.employees.index'));

        $response->assertStatus(200);
    }

    /**
     * Test that HR Staff can add a dependent.
     */
    public function test_hr_staff_can_add_dependent()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Staff');

        $department = Department::create(['name' => 'HR', 'code' => 'HRD']);
        $position = Position::create(['title' => 'HR Specialist', 'code' => 'HRS001', 'department_id' => $department->id, 'level' => 'junior']);
        $employee = Employee::factory()->create(['department_id' => $department->id, 'position_id' => $position->id]);

        $response = $this->actingAs($user)
            ->post(route('hr.employees.dependents.store', $employee), [
                'first_name' => 'StaffAdded',
                'last_name' => 'Dependent',
                'relationship' => 'spouse',
                'date_of_birth' => '1990-01-01',
            ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('employee_dependents', ['first_name' => 'StaffAdded']);
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
