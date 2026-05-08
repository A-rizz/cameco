<?php

namespace Tests\Feature\HR;

use App\Models\User;
use App\Models\Department;
use App\Models\Position;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class OrganizationManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles and permissions
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    /**
     * Test that an HR Manager can view departments and positions.
     */
    public function test_hr_manager_can_view_departments_and_positions()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $response = $this->actingAs($user)
            ->get(route('hr.departments.index'));
        $response->assertStatus(200);

        $response = $this->actingAs($user)
            ->get(route('hr.positions.index'));
        $response->assertStatus(200);
    }

    /**
     * Test that an HR Manager can create a department.
     */
    public function test_hr_manager_can_create_department()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $response = $this->actingAs($user)
            ->post(route('hr.departments.store'), [
                'name' => 'Engineering',
                'code' => 'ENG',
                'description' => 'Software Engineering Department'
            ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('departments', [
            'name' => 'Engineering',
            'code' => 'ENG'
        ]);
    }

    /**
     * Test that an HR Manager can update a department.
     */
    public function test_hr_manager_can_update_department()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $department = Department::create(['name' => 'Old Name', 'code' => 'OLD']);

        $response = $this->actingAs($user)
            ->put(route('hr.departments.update', $department), [
                'name' => 'New Name',
                'code' => 'NEW'
            ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
            'name' => 'New Name'
        ]);
    }

    /**
     * Test that an HR Manager can delete a department.
     */
    public function test_hr_manager_can_delete_department()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $department = Department::create(['name' => 'To Be Deleted', 'code' => 'TBD']);

        $response = $this->actingAs($user)
            ->delete(route('hr.departments.destroy', $department));

        $response->assertStatus(302);
        $this->assertSoftDeleted('departments', [
            'id' => $department->id
        ]);
    }

    /**
     * Test that an HR Manager can create a position.
     */
    public function test_hr_manager_can_create_position()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Manager');

        $department = Department::create(['name' => 'HR', 'code' => 'HRD']);

        $response = $this->actingAs($user)
            ->post(route('hr.positions.store'), [
                'title' => 'Senior Developer',
                'code' => 'SDEV',
                'department_id' => $department->id,
                'level' => 'senior'
            ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('positions', [
            'title' => 'Senior Developer',
            'code' => 'SDEV'
        ]);
    }

    /**
     * Test that HR Staff can view but NOT manage departments.
     */
    public function test_hr_staff_can_view_but_not_manage_departments()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Staff');

        // View - OK
        $response = $this->actingAs($user)
            ->get(route('hr.departments.index'));
        $response->assertStatus(200);

        // Create - Forbidden
        $response = $this->actingAs($user)
            ->post(route('hr.departments.store'), [
                'name' => 'Restricted',
                'code' => 'RES'
            ]);
        $response->assertForbidden();
    }

    /**
     * Test that HR Staff can view but NOT manage positions.
     */
    public function test_hr_staff_can_view_but_not_manage_positions()
    {
        $user = User::factory()->create();
        $user->assignRole('HR Staff');

        // View - OK
        $response = $this->actingAs($user)
            ->get(route('hr.positions.index'));
        $response->assertStatus(200);

        // Create - Forbidden
        $department = Department::create(['name' => 'HR', 'code' => 'HRD']);
        $response = $this->actingAs($user)
            ->post(route('hr.positions.store'), [
                'title' => 'Restricted Position',
                'code' => 'RPOS',
                'department_id' => $department->id,
                'level' => 'junior'
            ]);
        $response->assertForbidden();
    }
}
