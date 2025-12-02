<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeaveRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'leave_policy_id',
        'start_date',
        'end_date',
        'days_requested',
        'reason',
        'status',
        'supervisor_id',
        'supervisor_approved_at',
        'supervisor_comments',
        'manager_id',
        'manager_approved_at',
        'manager_comments',
        'hr_processed_by',
        'hr_processed_at',
        'hr_notes',
        'submitted_at',
        'submitted_by',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        'days_requested' => 'decimal:1',
        'start_date' => 'date',
        'end_date' => 'date',
        'submitted_at' => 'datetime',
        'supervisor_approved_at' => 'datetime',
        'manager_approved_at' => 'datetime',
        'hr_processed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function leavePolicy()
    {
        return $this->belongsTo(LeavePolicy::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(Employee::class, 'supervisor_id');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function hrProcessedBy()
    {
        return $this->belongsTo(User::class, 'hr_processed_by');
    }
}
