<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeaveBalance extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'leave_policy_id',
        'year',
        'earned',
        'used',
        'remaining',
        'carried_forward',
    ];

    protected $casts = [
        'earned' => 'decimal:1',
        'used' => 'decimal:1',
        'remaining' => 'decimal:1',
        'carried_forward' => 'decimal:1',
        'year' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function leavePolicy()
    {
        return $this->belongsTo(LeavePolicy::class);
    }
}
