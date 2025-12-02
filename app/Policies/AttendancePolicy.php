<?php

namespace App\Policies;

use App\Models\User;

class AttendancePolicy
{
    /**
     * Determine if the user can view attendance records.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('hr.timekeeping.view');
    }

    /**
     * Determine if the user can create attendance records.
     */
    public function create(User $user): bool
    {
        return $user->can('hr.timekeeping.attendance.create');
    }

    /**
     * Determine if the user can update attendance records.
     */
    public function update(User $user): bool
    {
        return $user->can('hr.timekeeping.attendance.update');
    }

    /**
     * Determine if the user can delete attendance records.
     */
    public function delete(User $user): bool
    {
        // Only HR Manager can delete attendance records
        return $user->hasRole(['HR Manager', 'Superadmin']);
    }

    /**
     * Determine if the user can approve overtime.
     */
    public function approveOvertime(User $user): bool
    {
        return $user->can('hr.timekeeping.overtime.approve');
    }

    /**
     * Determine if the user can manage timekeeping data.
     */
    public function manage(User $user): bool
    {
        return $user->can('hr.timekeeping.manage');
    }
}
