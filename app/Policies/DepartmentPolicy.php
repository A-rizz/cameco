<?php

namespace App\Policies;

use App\Models\Department;
use App\Models\User;

class DepartmentPolicy
{
    /**
     * Determine if the user can view any departments.
     * Note: All HR users can VIEW departments, but only HR Manager can MANAGE them.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('hr.departments.view') || $user->can('hr.dashboard.view');
    }

    /**
     * Determine if the user can view a specific department.
     */
    public function view(User $user, Department $department): bool
    {
        return $user->can('hr.departments.view') || $user->can('hr.dashboard.view');
    }

    /**
     * Determine if the user can create departments.
     * Only HR Manager can manage departments.
     */
    public function create(User $user): bool
    {
        return $user->can('hr.departments.manage');
    }

    /**
     * Determine if the user can update a department.
     * Only HR Manager can manage departments.
     */
    public function update(User $user, Department $department): bool
    {
        return $user->can('hr.departments.manage');
    }

    /**
     * Determine if the user can delete a department.
     * Only HR Manager can manage departments.
     */
    public function delete(User $user, Department $department): bool
    {
        return $user->can('hr.departments.manage');
    }
}
