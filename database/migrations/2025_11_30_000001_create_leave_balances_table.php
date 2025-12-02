<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('leave_policy_id')->nullable();
            $table->integer('year')->index();
            $table->decimal('earned', 6, 1)->default(0);
            $table->decimal('used', 6, 1)->default(0);
            $table->decimal('remaining', 6, 1)->default(0);
            $table->decimal('carried_forward', 6, 1)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
            $table->foreign('leave_policy_id')->references('id')->on('leave_policies')->onDelete('set null');
            $table->unique(['employee_id', 'leave_policy_id', 'year'], 'leave_balance_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_balances');
    }
};
