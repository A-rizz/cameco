<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;

class LeaveRequestPolicy
{
    /**
     * Determine if the user can view any leave requests.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('hr.leave-requests.view');
    }

    /**
     * Determine if the user can view a specific leave request.
     */
    public function view(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->can('hr.leave-requests.view');
    }

    /**
     * Determine if the user can create leave requests.
     */
    public function create(User $user): bool
    {
        return $user->can('hr.leave-requests.create');
    }

    /**
     * Determine if the user can update a leave request.
     */
    public function update(User $user, LeaveRequest $leaveRequest): bool
    {
        // Only allow updates to pending requests
        if ($leaveRequest->status !== 'pending') {
            return false;
        }
        
        return $user->can('hr.leave-requests.create');
    }

    /**
     * Determine if the user can approve/reject leave requests.
     */
    public function approve(User $user, LeaveRequest $leaveRequest): bool
    {
        // Only allow approval/rejection of pending requests
        if ($leaveRequest->status !== 'pending') {
            return false;
        }
        
        return $user->can('hr.leave-requests.approve');
    }

    /**
     * Determine if the user can delete a leave request.
     */
    public function delete(User $user, LeaveRequest $leaveRequest): bool
    {
        // Only allow deletion of pending or rejected requests
        if (!in_array($leaveRequest->status, ['pending', 'rejected'])) {
            return false;
        }
        
        return $user->can('hr.leave-requests.create');
    }

    /**
     * Determine if the user can cancel an approved leave request.
     */
    public function cancel(User $user, LeaveRequest $leaveRequest): bool
    {
        // Only allow cancellation of approved requests
        if ($leaveRequest->status !== 'approved') {
            return false;
        }
        
        return $user->can('hr.leave-requests.approve');
    }
}
