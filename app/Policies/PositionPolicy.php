<?php

namespace App\Policies;

use App\Models\Position;
use App\Models\User;

class PositionPolicy
{
    /**
     * Determine if the user can view any positions.
     * Note: All HR users can VIEW positions, but only HR Manager can MANAGE them.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('hr.positions.view') || $user->can('hr.dashboard.view');
    }

    /**
     * Determine if the user can view a specific position.
     */
    public function view(User $user, Position $position): bool
    {
        return $user->can('hr.positions.view') || $user->can('hr.dashboard.view');
    }

    /**
     * Determine if the user can create positions.
     * Only HR Manager can manage positions.
     */
    public function create(User $user): bool
    {
        return $user->can('hr.positions.manage');
    }

    /**
     * Determine if the user can update a position.
     * Only HR Manager can manage positions.
     */
    public function update(User $user, Position $position): bool
    {
        return $user->can('hr.positions.manage');
    }

    /**
     * Determine if the user can delete a position.
     * Only HR Manager can manage positions.
     */
    public function delete(User $user, Position $position): bool
    {
        return $user->can('hr.positions.manage');
    }
}
