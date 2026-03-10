<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('leave_policy_id');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('days_requested', 5, 1);
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');

            // Approval workflow
            $table->unsignedBigInteger('supervisor_id')->nullable();
            $table->timestamp('supervisor_approved_at')->nullable();
            $table->text('supervisor_comments')->nullable();

            $table->unsignedBigInteger('manager_id')->nullable();
            $table->timestamp('manager_approved_at')->nullable();
            $table->text('manager_comments')->nullable();

            // HR processing
            $table->unsignedBigInteger('hr_processed_by')->nullable();
            $table->timestamp('hr_processed_at')->nullable();
            $table->text('hr_notes')->nullable();

            // meta
            $table->timestamp('submitted_at')->nullable();
            $table->unsignedBigInteger('submitted_by');
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // indexes & foreign keys (employees referenced by id)
            $table->index('employee_id', 'idx_leave_requests_employee_id');
            $table->index('status', 'idx_leave_requests_status');
            $table->index('leave_policy_id', 'idx_leave_requests_leave_policy_id');
            $table->index(['start_date', 'end_date'], 'idx_leave_requests_dates');

            $table->foreign('leave_policy_id')->references('id')->on('leave_policies')->onDelete('restrict');
            // employee foreign keys are intentionally left as simple ids because employee model may vary
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
